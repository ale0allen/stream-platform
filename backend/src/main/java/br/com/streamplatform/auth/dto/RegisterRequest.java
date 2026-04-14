package br.com.streamplatform.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "{validation.notBlank}") @Email(message = "{validation.email}") String email,
        @NotBlank(message = "{validation.notBlank}") @Size(min = 8, max = 100, message = "{validation.size}") String password,
        @NotBlank(message = "{validation.notBlank}") @Size(min = 2, max = 100, message = "{validation.size}") String displayName,
        @NotBlank(message = "{validation.notBlank}") @Size(min = 3, max = 50, message = "{validation.size}") String username
) {
}
