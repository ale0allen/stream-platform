package br.com.streamplatform.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank @Size(min = 2, max = 100) String displayName,
        @NotBlank @Size(min = 3, max = 50) String username,
        @Size(max = 1000) String bio,
        @Size(max = 500) String avatarUrl
) {
}
