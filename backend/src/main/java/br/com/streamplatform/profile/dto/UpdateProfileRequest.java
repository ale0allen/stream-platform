package br.com.streamplatform.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "{validation.notBlank}") @Size(min = 2, max = 100, message = "{validation.size}") String displayName,
        @NotBlank(message = "{validation.notBlank}")
        @Size(min = 3, max = 30, message = "{validation.size}")
        @Pattern(regexp = "^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$", message = "{validation.username}")
        String username,
        @Size(max = 280, message = "{validation.size}") String bio,
        @Size(max = 500, message = "{validation.size}")
        @Pattern(regexp = "^$|https?://.+", message = "{validation.avatarUrl}")
        String avatarUrl
) {
}
