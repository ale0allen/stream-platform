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
}
