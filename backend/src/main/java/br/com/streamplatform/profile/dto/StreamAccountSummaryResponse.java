package br.com.streamplatform.profile.dto;

import br.com.streamplatform.stream.model.StreamPlatformType;

import java.util.UUID;

public record StreamAccountSummaryResponse(
        UUID id,
        StreamPlatformType platform,
        String platformUsername,
        String channelUrl
) {
}
