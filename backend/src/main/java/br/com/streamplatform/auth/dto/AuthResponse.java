package br.com.streamplatform.auth.dto;

import br.com.streamplatform.user.model.Role;

import java.util.UUID;

public record AuthResponse(
        String token,
        UUID userId,
        String email,
        Role role
) {
}
