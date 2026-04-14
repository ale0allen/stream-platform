package br.com.streamplatform.user.controller;

import br.com.streamplatform.auth.model.AuthenticatedUser;
import br.com.streamplatform.user.dto.UserMeResponse;
import br.com.streamplatform.user.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserMeResponse me(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        return userService.getCurrentUser(authenticatedUser);
    }
}
