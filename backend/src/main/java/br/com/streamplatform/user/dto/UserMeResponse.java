package br.com.streamplatform.user.dto;

import br.com.streamplatform.user.model.Role;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserMeResponse(
        UUID id,
        String email,
        Role role,
        boolean active,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
