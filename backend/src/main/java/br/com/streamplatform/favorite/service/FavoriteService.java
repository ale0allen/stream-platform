package br.com.streamplatform.favorite.service;

import br.com.streamplatform.common.exception.BusinessException;
import br.com.streamplatform.favorite.dto.CreateFavoriteRequest;
import br.com.streamplatform.favorite.dto.FavoriteResponse;
import br.com.streamplatform.favorite.model.Favorite;
import br.com.streamplatform.favorite.repository.FavoriteRepository;
import br.com.streamplatform.profile.dto.ProfileResponse;
import br.com.streamplatform.profile.repository.ProfileRepository;
import br.com.streamplatform.profile.service.ProfileService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProfileRepository profileRepository;
    private final ProfileService profileService;

    public FavoriteService(
            FavoriteRepository favoriteRepository,
            ProfileRepository profileRepository,
            ProfileService profileService
    ) {
        this.favoriteRepository = favoriteRepository;
        this.profileRepository = profileRepository;
        this.profileService = profileService;
    }

    public List<FavoriteResponse> listFavorites(UUID userId) {
        List<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<UUID> profileIds = favorites.stream().map(Favorite::getProfileId).toList();
        Map<UUID, ProfileResponse> profilesById = profileRepository.findAllById(profileIds)
                .stream()
                .map(profile -> profileService.getByUserId(profile.getUser().getId()))
                .collect(Collectors.toMap(ProfileResponse::id, Function.identity()));

        return favorites.stream()
                .map(favorite -> new FavoriteResponse(
                        favorite.getId(),
                        favorite.getProfileId(),
                        favorite.getCreatedAt(),
                        profilesById.get(favorite.getProfileId())
                ))
                .filter(response -> response.profile() != null)
                .toList();
    }

    @Transactional
    public FavoriteResponse addFavorite(UUID userId, CreateFavoriteRequest request) {
        UUID profileId = request.profileId();

        if (favoriteRepository.existsByUserIdAndProfileId(userId, profileId)) {
            throw new BusinessException(HttpStatus.CONFLICT, "Profile is already in favorites");
        }

        ProfileResponse profile = profileRepository.findById(profileId)
                .map(entity -> profileService.getByUserId(entity.getUser().getId()))
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Profile not found"));

        Favorite favorite = favoriteRepository.save(new Favorite(userId, profileId));
        return new FavoriteResponse(
                favorite.getId(),
                favorite.getProfileId(),
                favorite.getCreatedAt(),
                profile
        );
    }

    @Transactional
    public void removeFavorite(UUID userId, UUID profileId) {
        boolean exists = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .anyMatch(favorite -> favorite.getProfileId().equals(profileId));

        if (!exists) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "Favorite not found");
        }

        favoriteRepository.deleteByUserIdAndProfileId(userId, profileId);
    }
}
