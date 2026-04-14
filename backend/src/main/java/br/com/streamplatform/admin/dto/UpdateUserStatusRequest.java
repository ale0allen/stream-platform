package br.com.streamplatform.admin.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(
        @NotNull(message = "{validation.notNull}") Boolean active
) {
}
