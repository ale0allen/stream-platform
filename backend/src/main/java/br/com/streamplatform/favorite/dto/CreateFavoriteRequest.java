package br.com.streamplatform.favorite.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateFavoriteRequest(
        @NotNull(message = "{validation.notNull}") UUID profileId
) {
}
