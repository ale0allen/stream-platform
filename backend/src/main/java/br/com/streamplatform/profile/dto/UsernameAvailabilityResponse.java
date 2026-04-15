package br.com.streamplatform.profile.dto;

public record UsernameAvailabilityResponse(
        String username,
        boolean available
) {
}
