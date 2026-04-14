package br.com.streamplatform.profile.service;

import br.com.streamplatform.common.exception.BusinessException;
import br.com.streamplatform.profile.dto.ProfileResponse;
import br.com.streamplatform.profile.dto.UpdateProfileRequest;
import br.com.streamplatform.profile.model.Profile;
import br.com.streamplatform.profile.repository.ProfileRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
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
                profile.getCreatedAt(),
                profile.getUpdatedAt()
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
