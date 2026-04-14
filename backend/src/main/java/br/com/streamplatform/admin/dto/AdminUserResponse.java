package br.com.streamplatform.admin.dto;

import br.com.streamplatform.user.model.Role;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String email,
        Role role,
        boolean active,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
