package br.com.streamplatform.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "{validation.notBlank}") @Size(min = 2, max = 100, message = "{validation.size}") String displayName,
        @NotBlank(message = "{validation.notBlank}") @Size(min = 3, max = 50, message = "{validation.size}") String username,
        @Size(max = 1000, message = "{validation.size}") String bio,
        @Size(max = 500, message = "{validation.size}") String avatarUrl
) {
}
