package br.com.streamplatform.stream.dto;

import br.com.streamplatform.stream.model.StreamPlatformType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateStreamAccountRequest(
        @NotNull(message = "{validation.notNull}") StreamPlatformType platform,
        @NotBlank(message = "{validation.notBlank}")
        @Size(min = 2, max = 100, message = "{validation.size}")
        @Pattern(regexp = "^[a-zA-Z0-9][a-zA-Z0-9._-]*$", message = "{validation.streamUsername}")
        String username,
        @NotBlank(message = "{validation.notBlank}")
        @Size(max = 500, message = "{validation.size}")
        @Pattern(regexp = "https?://.+", message = "{validation.channelUrl}")
        String url
) {
}
