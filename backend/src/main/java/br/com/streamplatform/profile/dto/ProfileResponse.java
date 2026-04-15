package br.com.streamplatform.profile.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ProfileResponse(
        UUID id,
        UUID userId,
        String displayName,
        String username,
        String bio,
        String avatarUrl,
        List<StreamAccountSummaryResponse> streamAccounts,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
