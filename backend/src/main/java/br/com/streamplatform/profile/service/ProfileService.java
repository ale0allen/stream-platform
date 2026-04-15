package br.com.streamplatform.profile.service;

import br.com.streamplatform.common.exception.BusinessException;
import br.com.streamplatform.profile.dto.ProfileResponse;
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

import java.util.List;
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

    public List<ProfileResponse> listProfiles(String query) {
        String normalized = query == null ? "" : query.trim();
        List<Profile> profiles = normalized.isBlank()
                ? profileRepository.findAll().stream().sorted((left, right) -> left.getDisplayName().compareToIgnoreCase(right.getDisplayName())).toList()
                : profileRepository.findByDisplayNameContainingIgnoreCaseOrUsernameContainingIgnoreCaseOrderByDisplayNameAsc(normalized, normalized);

        return profiles.stream().map(this::toResponse).toList();
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
                streamAccount.getChannelUrl()
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
