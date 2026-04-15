package br.com.streamplatform.profile.dto;

import java.util.List;
import java.util.UUID;

public record PublicProfileResponse(
        UUID profileId,
        String displayName,
        String username,
        String bio,
        String avatarUrl,
        List<StreamAccountSummaryResponse> streamAccounts
) {
}
