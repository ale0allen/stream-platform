package br.com.streamplatform.stream.oauth;

import br.com.streamplatform.auth.model.AuthenticatedUser;
import br.com.streamplatform.common.exception.BusinessException;
import br.com.streamplatform.stream.oauth.dto.OAuthStartResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import static org.springframework.http.HttpStatus.NO_CONTENT;

@RestController
@RequestMapping("/api/stream-accounts/oauth/twitch")
public class TwitchOAuthController {

    private final TwitchOAuthService twitchOAuthService;
    private final TwitchOAuthProperties properties;

    public TwitchOAuthController(TwitchOAuthService twitchOAuthService, TwitchOAuthProperties properties) {
        this.twitchOAuthService = twitchOAuthService;
        this.properties = properties;
    }

    @GetMapping("/start")
    public OAuthStartResponse start(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        String authorizeUrl = twitchOAuthService.buildAuthorizeUrl(authenticatedUser.getId());
        return new OAuthStartResponse(authorizeUrl);
    }

    @GetMapping("/callback")
    public void callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            @RequestParam(required = false) String error_description,
            HttpServletResponse response
    ) throws IOException {
        String base = properties.frontendRedirectBaseUrl().replaceAll("/+$", "");

        if (error != null && !error.isBlank()) {
            response.sendRedirect(base + "/profile?oauth=twitch&status=error&reason=" + encode(error));
            return;
        }

        if (code == null || code.isBlank() || state == null || state.isBlank()) {
            response.sendRedirect(base + "/profile?oauth=twitch&status=error&reason=missing_params");
            return;
        }

        try {
            twitchOAuthService.handleCallback(code, state);
            response.sendRedirect(base + "/profile?oauth=twitch&status=success");
        } catch (BusinessException e) {
            response.sendRedirect(base + "/profile?oauth=twitch&status=error&reason=" + encode(e.getMessage()));
        } catch (Exception e) {
            response.sendRedirect(base + "/profile?oauth=twitch&status=error&reason=unexpected");
        }
    }

    @DeleteMapping
    @ResponseStatus(NO_CONTENT)
    public void disconnect(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        twitchOAuthService.disconnect(authenticatedUser.getId());
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }
}

