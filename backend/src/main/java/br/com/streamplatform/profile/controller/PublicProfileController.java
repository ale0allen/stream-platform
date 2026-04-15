package br.com.streamplatform.profile.controller;

import br.com.streamplatform.profile.dto.PublicProfileResponse;
import br.com.streamplatform.profile.service.ProfileService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/profile")
public class PublicProfileController {

    private final ProfileService profileService;

    public PublicProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/{username}")
    public PublicProfileResponse getByUsername(@PathVariable String username) {
        return profileService.getPublicByUsername(username);
    }
}
