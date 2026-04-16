package br.com.streamplatform.profile.dto;

public record CreatorMetricsResponse(
        long totalCreators,
        long completeProfiles,
        long linkedAccounts
) {
}

