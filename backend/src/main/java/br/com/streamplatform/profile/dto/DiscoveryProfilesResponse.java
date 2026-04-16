package br.com.streamplatform.profile.dto;

import java.util.List;

public record DiscoveryProfilesResponse(
        List<ProfileResponse> items,
        long totalCount,
        int page,
        int size
) {
}

