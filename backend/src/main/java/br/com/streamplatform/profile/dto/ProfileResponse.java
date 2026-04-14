package br.com.streamplatform.profile.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ProfileResponse(
        UUID id,
        UUID userId,
        String displayName,
        String username,
        String bio,
        String avatarUrl,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
