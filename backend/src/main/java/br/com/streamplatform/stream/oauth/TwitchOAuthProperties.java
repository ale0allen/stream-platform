package br.com.streamplatform.stream.oauth;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.oauth.twitch")
public record TwitchOAuthProperties(
        String clientId,
        String clientSecret,
        String redirectUri,
        String scopes,
        String stateSecret,
        String frontendRedirectBaseUrl
) {
}

