package br.com.streamplatform.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "{validation.notBlank}") @Email(message = "{validation.email}") String email,
        @NotBlank(message = "{validation.notBlank}") String password
) {
}
