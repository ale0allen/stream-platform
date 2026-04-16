package br.com.streamplatform.profile.controller;

import br.com.streamplatform.auth.model.AuthenticatedUser;
import br.com.streamplatform.profile.dto.ProfileResponse;
import br.com.streamplatform.profile.dto.UpdateProfileRequest;
import br.com.streamplatform.profile.dto.UsernameAvailabilityResponse;
import br.com.streamplatform.profile.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.streamplatform.profile.dto.DiscoveryProfilesResponse;
import br.com.streamplatform.profile.dto.DiscoveryHighlightsResponse;
import br.com.streamplatform.profile.dto.CreatorMetricsResponse;
import br.com.streamplatform.stream.model.StreamPlatformType;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ProfileResponse me(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        return profileService.getByUserId(authenticatedUser.getId());
    }

    @PutMapping("/me")
    public ProfileResponse updateMe(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return profileService.updateCurrentProfile(authenticatedUser.getId(), request);
    }

    @GetMapping("/username-availability")
    public UsernameAvailabilityResponse usernameAvailability(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam String username
    ) {
        return profileService.checkUsernameAvailability(authenticatedUser.getId(), username);
    }

    @GetMapping
    public List<ProfileResponse> list(@RequestParam(required = false) String q) {
        return profileService.listProfiles(q);
    }

    @GetMapping("/discovery")
    public DiscoveryProfilesResponse discovery(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false, defaultValue = "name_asc") String sort,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "8") int size
    ) {
        StreamPlatformType platformEnum = null;
        if (platform != null && !platform.isBlank() && !platform.equalsIgnoreCase("ALL")) {
            try {
                platformEnum = StreamPlatformType.valueOf(platform.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                platformEnum = null;
            }
        }

        return profileService.discoveryProfiles(q, platformEnum, sort, page, size);
    }

    @GetMapping("/highlights")
    public DiscoveryHighlightsResponse highlights(@RequestParam(required = false, defaultValue = "6") int limit) {
        return profileService.discoveryHighlights(limit);
    }

    @GetMapping("/metrics")
    public CreatorMetricsResponse metrics() {
        return profileService.creatorMetrics();
    }
}
