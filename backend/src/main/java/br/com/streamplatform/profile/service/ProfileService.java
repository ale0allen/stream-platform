package br.com.streamplatform.profile.service;

import br.com.streamplatform.common.exception.BusinessException;
import br.com.streamplatform.profile.dto.ProfileResponse;
import br.com.streamplatform.profile.dto.PublicProfileResponse;
import br.com.streamplatform.profile.dto.DiscoveryProfilesResponse;
import br.com.streamplatform.profile.dto.DiscoveryHighlightsResponse;
import br.com.streamplatform.profile.dto.CreatorMetricsResponse;
import br.com.streamplatform.profile.dto.StreamAccountSummaryResponse;
import br.com.streamplatform.profile.dto.UpdateProfileRequest;
import br.com.streamplatform.profile.dto.UsernameAvailabilityResponse;
import br.com.streamplatform.profile.model.Profile;
import br.com.streamplatform.profile.repository.ProfileRepository;
import br.com.streamplatform.stream.model.StreamAccount;
import br.com.streamplatform.stream.repository.StreamAccountRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import br.com.streamplatform.stream.model.StreamPlatformType;

import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Set;
import java.util.HashSet;
import java.util.UUID;

@Service
public class ProfileService {

    private static final String USERNAME_PATTERN = "^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$";

    private final ProfileRepository profileRepository;
    private final StreamAccountRepository streamAccountRepository;

    public ProfileService(ProfileRepository profileRepository, StreamAccountRepository streamAccountRepository) {
        this.profileRepository = profileRepository;
        this.streamAccountRepository = streamAccountRepository;
    }

    public ProfileResponse getByUserId(UUID userId) {
        return toResponse(findEntityByUserId(userId));
    }

    public PublicProfileResponse getPublicByUsername(String username) {
        String normalizedUsername = username == null ? "" : username.trim().toLowerCase();
        Profile profile = profileRepository.findByUsername(normalizedUsername)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "error.profile.notFound"));

        return new PublicProfileResponse(
                profile.getId(),
                profile.getDisplayName(),
                profile.getUsername(),
                profile.getBio(),
                profile.getAvatarUrl(),
                streamAccountRepository.findByUserIdOrderByPlatformAsc(profile.getUser().getId())
                        .stream()
                        .map(this::toStreamAccountResponse)
                        .toList()
        );
    }

    public List<ProfileResponse> listProfiles(String query) {
        String normalized = query == null ? "" : query.trim();
        List<Profile> profiles = normalized.isBlank()
                ? profileRepository.findAll().stream().sorted((left, right) -> left.getDisplayName().compareToIgnoreCase(right.getDisplayName())).toList()
                : profileRepository.findByDisplayNameContainingIgnoreCaseOrUsernameContainingIgnoreCaseOrderByDisplayNameAsc(normalized, normalized);

        return profiles.stream().map(this::toResponse).toList();
    }

    public DiscoveryProfilesResponse discoveryProfiles(String query, StreamPlatformType platform, String sort, int page, int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 24);

        // Reaproveita a listagem atual (inclui streamAccounts) e aplica ordenacao/filtragem/paginacao em memoria.
        // Isso evita mudar a forma como os dados de ProfileResponse sao montados (mantem contrato limpo).
        List<ProfileResponse> all = listProfiles(query);

        List<ProfileResponse> filtered = all;
        if (platform != null) {
            filtered = all.stream()
                    .filter(profile -> profile.streamAccounts() != null && profile.streamAccounts().stream().anyMatch(sa -> sa.platform() == platform))
                    .toList();
        }

        String normalizedSort = sort == null ? "name_asc" : sort.trim().toLowerCase();
        List<ProfileResponse> sorted = new ArrayList<>(filtered);

        sorted.sort(getDiscoveryComparator(normalizedSort));

        long totalCount = sorted.size();
        int pageIndex = safePage - 1;
        int start = pageIndex * safeSize;
        int end = Math.min(start + safeSize, sorted.size());

        List<ProfileResponse> items = start >= sorted.size() ? List.of() : sorted.subList(start, end);

        return new DiscoveryProfilesResponse(items, totalCount, safePage, safeSize);
    }

    public DiscoveryHighlightsResponse discoveryHighlights(int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 12);

        List<Profile> allProfiles = profileRepository.findAll();
        Set<UUID> usersWithStreamAccounts = new HashSet<>(streamAccountRepository.findDistinctUserIds());

        List<Profile> withAccounts = allProfiles.stream()
                .filter(profile -> usersWithStreamAccounts.contains(profile.getUser().getId()))
                .toList();

        List<Profile> featured = withAccounts.stream()
                .sorted((left, right) -> {
                    int completionCompare = Integer.compare(getCompletionPercent(right, true), getCompletionPercent(left, true));
                    if (completionCompare != 0) return completionCompare;
                    if (left.getUpdatedAt() == null && right.getUpdatedAt() == null) return 0;
                    if (left.getUpdatedAt() == null) return 1;
                    if (right.getUpdatedAt() == null) return -1;
                    return right.getUpdatedAt().compareTo(left.getUpdatedAt());
                })
                .limit(safeLimit)
                .toList();

        List<Profile> recent = allProfiles.stream()
                .sorted((left, right) -> {
                    if (left.getCreatedAt() == null && right.getCreatedAt() == null) return 0;
                    if (left.getCreatedAt() == null) return 1;
                    if (right.getCreatedAt() == null) return -1;
                    return right.getCreatedAt().compareTo(left.getCreatedAt());
                })
                .limit(safeLimit)
                .toList();

        List<Profile> complete = withAccounts.stream()
                .filter(profile -> getCompletionPercent(profile, true) >= 100)
                .sorted((left, right) -> {
                    if (left.getUpdatedAt() == null && right.getUpdatedAt() == null) return 0;
                    if (left.getUpdatedAt() == null) return 1;
                    if (right.getUpdatedAt() == null) return -1;
                    return right.getUpdatedAt().compareTo(left.getUpdatedAt());
                })
                .limit(safeLimit)
                .toList();

        return new DiscoveryHighlightsResponse(
                featured.stream().map(this::toResponse).toList(),
                recent.stream().map(this::toResponse).toList(),
                complete.stream().map(this::toResponse).toList()
        );
    }

    public CreatorMetricsResponse creatorMetrics() {
        long totalCreators = profileRepository.count();
        long linkedAccounts = streamAccountRepository.count();

        List<Profile> profiles = profileRepository.findAll();
        Set<UUID> usersWithStreamAccounts = new HashSet<>(streamAccountRepository.findDistinctUserIds());

        long completeProfiles = profiles.stream()
                .filter(profile -> usersWithStreamAccounts.contains(profile.getUser().getId()))
                .filter(profile -> getCompletionPercent(profile, true) >= 100)
                .count();

        return new CreatorMetricsResponse(totalCreators, completeProfiles, linkedAccounts);
    }

    private Comparator<ProfileResponse> getDiscoveryComparator(String sort) {
        return switch (sort) {
            case "recent" -> Comparator
                    .comparing(ProfileResponse::updatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                    .reversed()
                    .thenComparing(ProfileResponse::displayName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "name_desc" -> Comparator
                    .comparing(ProfileResponse::displayName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                    .reversed()
                    .thenComparing(ProfileResponse::username, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "complete" -> (left, right) -> {
                int completionCompare = Integer.compare(getCompletionPercent(right), getCompletionPercent(left));
                if (completionCompare != 0) {
                    return completionCompare;
                }

                // Atualizacao mais recente primeiro (desempate).
                if (left.updatedAt() != null || right.updatedAt() != null) {
                    if (left.updatedAt() == null) return 1;
                    if (right.updatedAt() == null) return -1;
                    int updatedCompare = left.updatedAt().compareTo(right.updatedAt());
                    if (updatedCompare != 0) return -updatedCompare;
                }

                // Por fim, exibir nome de forma estavel.
                if (left.displayName() == null && right.displayName() == null) return 0;
                if (left.displayName() == null) return 1;
                if (right.displayName() == null) return -1;
                return String.CASE_INSENSITIVE_ORDER.compare(left.displayName(), right.displayName());
            };
            case "name_asc":
            default -> Comparator
                    .comparing(ProfileResponse::displayName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                    .thenComparing(ProfileResponse::username, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        };
    }

    // Calcula completude seguindo as mesmas regras do ProfilePage (mas com campos vindos do ProfileResponse).
    private int getCompletionPercent(ProfileResponse profile) {
        int total = 5;
        int completed = 0;

        String displayName = profile.displayName();
        if (displayName != null && displayName.trim().length() >= 2) completed++;

        String username = profile.username();
        if (username != null && username.trim().length() >= 3 && username.trim().length() <= 30) completed++;

        String bio = profile.bio();
        if (bio != null && bio.trim().length() >= 30) completed++;

        String avatarUrl = profile.avatarUrl();
        if (avatarUrl != null && !avatarUrl.trim().isBlank()) completed++;

        List<?> streamAccounts = profile.streamAccounts();
        if (streamAccounts != null && !streamAccounts.isEmpty()) completed++;

        return (int) Math.round((completed / (double) total) * 100);
    }

    private int getCompletionPercent(Profile profile, boolean hasStreamAccount) {
        int total = 5;
        int completed = 0;

        if (profile.getDisplayName() != null && profile.getDisplayName().trim().length() >= 2) completed++;
        if (profile.getUsername() != null && profile.getUsername().trim().length() >= 3 && profile.getUsername().trim().length() <= 30) completed++;
        if (profile.getBio() != null && profile.getBio().trim().length() >= 30) completed++;
        if (profile.getAvatarUrl() != null && !profile.getAvatarUrl().trim().isBlank()) completed++;
        if (hasStreamAccount) completed++;

        return (int) Math.round((completed / (double) total) * 100);
    }

    public UsernameAvailabilityResponse checkUsernameAvailability(UUID userId, String username) {
        String normalizedUsername = username == null ? "" : username.trim().toLowerCase();
        boolean available = normalizedUsername.matches(USERNAME_PATTERN)
                && normalizedUsername.length() >= 3
                && normalizedUsername.length() <= 30
                && !profileRepository.existsByUsernameAndUserIdNot(normalizedUsername, userId);

        return new UsernameAvailabilityResponse(normalizedUsername, available);
    }

    @Transactional
    public ProfileResponse updateCurrentProfile(UUID userId, UpdateProfileRequest request) {
        Profile profile = findEntityByUserId(userId);
        String normalizedUsername = request.username().trim().toLowerCase();

        if (profileRepository.existsByUsernameAndUserIdNot(normalizedUsername, userId)) {
            throw new BusinessException(HttpStatus.CONFLICT, "error.profile.usernameInUse");
        }

        profile.update(
                request.displayName().trim(),
                normalizedUsername,
                normalizeBlank(request.bio()),
                normalizeBlank(request.avatarUrl())
        );

        return toResponse(profile);
    }

    public Profile findEntityByUserId(UUID userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "error.profile.notFound"));
        return profile;
    }

    private ProfileResponse toResponse(Profile profile) {
        return new ProfileResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getDisplayName(),
                profile.getUsername(),
                profile.getBio(),
                profile.getAvatarUrl(),
                streamAccountRepository.findByUserIdOrderByPlatformAsc(profile.getUser().getId())
                        .stream()
                        .map(this::toStreamAccountResponse)
                        .toList(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }

    private StreamAccountSummaryResponse toStreamAccountResponse(StreamAccount streamAccount) {
        return new StreamAccountSummaryResponse(
                streamAccount.getId(),
                streamAccount.getPlatform(),
                streamAccount.getPlatformUsername(),
                streamAccount.getChannelUrl(),
                streamAccount.getConnectionType()
        );
    }

    private String normalizeBlank(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
