package br.com.streamplatform.favorite.dto;

import br.com.streamplatform.profile.dto.ProfileResponse;

import java.time.OffsetDateTime;
import java.util.UUID;

public record FavoriteResponse(
        UUID id,
        UUID profileId,
        OffsetDateTime createdAt,
        ProfileResponse profile
) {
}
