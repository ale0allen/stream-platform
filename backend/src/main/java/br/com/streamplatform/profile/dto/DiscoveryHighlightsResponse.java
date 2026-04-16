package br.com.streamplatform.profile.dto;

import java.util.List;

public record DiscoveryHighlightsResponse(
        List<ProfileResponse> featured,
        List<ProfileResponse> recent,
        List<ProfileResponse> complete
) {
}

