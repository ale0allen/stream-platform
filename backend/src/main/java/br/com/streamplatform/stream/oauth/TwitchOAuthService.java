package br.com.streamplatform.stream.oauth;

import br.com.streamplatform.common.exception.BusinessException;
import br.com.streamplatform.profile.dto.StreamAccountSummaryResponse;
import br.com.streamplatform.stream.model.StreamAccount;
import br.com.streamplatform.stream.model.StreamAccountConnectionType;
import br.com.streamplatform.stream.model.StreamPlatformType;
import br.com.streamplatform.stream.repository.StreamAccountRepository;
import br.com.streamplatform.user.model.User;
import br.com.streamplatform.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class TwitchOAuthService {

    private static final String AUTHORIZE_URL = "https://id.twitch.tv/oauth2/authorize";
    private static final String TOKEN_URL = "https://id.twitch.tv/oauth2/token";
    private static final String USERS_URL = "https://api.twitch.tv/helix/users";
    private static final Duration STATE_MAX_AGE = Duration.ofMinutes(10);

    private final TwitchOAuthProperties properties;
    private final StreamAccountRepository streamAccountRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public TwitchOAuthService(
            TwitchOAuthProperties properties,
            StreamAccountRepository streamAccountRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.properties = properties;
        this.streamAccountRepository = streamAccountRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();
    }

    public String buildAuthorizeUrl(UUID userId) {
        requireConfigured();

        String state = TwitchState.sign(userId, properties.stateSecret());
        String scopes = properties.scopes() == null ? "" : properties.scopes().trim();

        String query = buildQuery(Map.of(
                "client_id", properties.clientId(),
                "redirect_uri", properties.redirectUri(),
                "response_type", "code",
                "scope", scopes,
                "state", state
        ));

        return AUTHORIZE_URL + "?" + query;
    }

    @Transactional
    public StreamAccountSummaryResponse handleCallback(String code, String state) {
        requireConfigured();

        TwitchState.Payload payload = TwitchState.verify(state, properties.stateSecret())
                .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "error.oauth.invalidState"));

        if (Duration.between(payload.issuedAt(), Instant.now()).compareTo(STATE_MAX_AGE) > 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "error.oauth.stateExpired");
        }

        UUID userId = payload.userId();

        TwitchTokens tokens = exchangeCodeForTokens(code);
        TwitchUser twitchUser = fetchTwitchUser(tokens.accessToken());

        // Ensure a Twitch account cannot be linked to multiple users.
        Optional<StreamAccount> existingByTwitchId = streamAccountRepository.findByPlatformAndPlatformUserId(StreamPlatformType.TWITCH, twitchUser.id());
        if (existingByTwitchId.isPresent() && !existingByTwitchId.get().getUser().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.CONFLICT, "error.oauth.twitchAlreadyLinked");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "error.user.notFound"));

        String channelUrl = "https://www.twitch.tv/" + twitchUser.login();

        StreamAccount streamAccount = streamAccountRepository.findByUserIdAndPlatform(userId, StreamPlatformType.TWITCH)
                .map(existing -> {
                    existing.updateOauthIdentity(twitchUser.id(), twitchUser.login(), channelUrl);
                    return existing;
                })
                .orElseGet(() -> streamAccountRepository.save(new StreamAccount(
                        user,
                        StreamPlatformType.TWITCH,
                        twitchUser.id(),
                        twitchUser.login(),
                        channelUrl,
                        StreamAccountConnectionType.OAUTH
                )));

        return new StreamAccountSummaryResponse(
                streamAccount.getId(),
                streamAccount.getPlatform(),
                streamAccount.getPlatformUsername(),
                streamAccount.getChannelUrl(),
                streamAccount.getConnectionType()
        );
    }

    @Transactional
    public void disconnect(UUID userId) {
        streamAccountRepository.findByUserIdAndPlatform(userId, StreamPlatformType.TWITCH)
                .ifPresent(account -> streamAccountRepository.deleteByIdAndUserId(account.getId(), userId));
    }

    private TwitchTokens exchangeCodeForTokens(String code) {
        try {
            String body = buildQuery(Map.of(
                    "client_id", properties.clientId(),
                    "client_secret", properties.clientSecret(),
                    "code", code,
                    "grant_type", "authorization_code",
                    "redirect_uri", properties.redirectUri()
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(TOKEN_URL))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "error.oauth.twitchTokenExchangeFailed");
            }

            JsonNode json = objectMapper.readTree(response.body());
            String accessToken = json.path("access_token").asText("");
            if (accessToken.isBlank()) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "error.oauth.twitchTokenExchangeFailed");
            }

            return new TwitchTokens(accessToken);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "error.oauth.twitchTokenExchangeFailed");
        }
    }

    private TwitchUser fetchTwitchUser(String accessToken) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(USERS_URL))
                    .timeout(Duration.ofSeconds(10))
                    .header("Client-Id", properties.clientId())
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "error.oauth.twitchFetchUserFailed");
            }

            JsonNode json = objectMapper.readTree(response.body());
            JsonNode first = json.path("data").isArray() && json.path("data").size() > 0 ? json.path("data").get(0) : null;
            if (first == null) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "error.oauth.twitchFetchUserFailed");
            }

            String id = first.path("id").asText("");
            String login = first.path("login").asText("");
            if (id.isBlank() || login.isBlank()) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "error.oauth.twitchFetchUserFailed");
            }

            return new TwitchUser(id, login);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "error.oauth.twitchFetchUserFailed");
        }
    }

    private void requireConfigured() {
        if (properties.clientId() == null || properties.clientId().isBlank()
                || properties.clientSecret() == null || properties.clientSecret().isBlank()
                || properties.redirectUri() == null || properties.redirectUri().isBlank()
                || properties.stateSecret() == null || properties.stateSecret().isBlank()
                || properties.frontendRedirectBaseUrl() == null || properties.frontendRedirectBaseUrl().isBlank()) {
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "error.oauth.notConfigured");
        }
    }

    private String buildQuery(Map<String, String> params) {
        return params.entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .reduce((left, right) -> left + "&" + right)
                .orElse("");
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    record TwitchTokens(String accessToken) {
    }

    record TwitchUser(String id, String login) {
    }

    static class TwitchState {
        record Payload(UUID userId, Instant issuedAt) {
        }

        static String sign(UUID userId, String secret) {
            String issuedAt = String.valueOf(Instant.now().getEpochSecond());
            String payload = userId + "." + issuedAt;
            String signature = hmacSha256Base64Url(payload, secret);
            return base64Url(payload.getBytes(StandardCharsets.UTF_8)) + "." + signature;
        }

        static Optional<Payload> verify(String state, String secret) {
            try {
                if (state == null || state.isBlank()) return Optional.empty();
                String[] parts = state.split("\\.");
                if (parts.length != 2) return Optional.empty();
                String payloadRaw = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
                String expectedSig = hmacSha256Base64Url(payloadRaw, secret);
                if (!constantTimeEquals(expectedSig, parts[1])) return Optional.empty();

                String[] payloadParts = payloadRaw.split("\\.");
                if (payloadParts.length != 2) return Optional.empty();
                UUID userId = UUID.fromString(payloadParts[0]);
                long issuedAtSeconds = Long.parseLong(payloadParts[1]);
                return Optional.of(new Payload(userId, Instant.ofEpochSecond(issuedAtSeconds)));
            } catch (Exception e) {
                return Optional.empty();
            }
        }

        private static String hmacSha256Base64Url(String data, String secret) {
            try {
                javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
                mac.init(new javax.crypto.spec.SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
                byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
                return base64Url(digest);
            } catch (Exception e) {
                throw new IllegalStateException(e);
            }
        }

        private static String base64Url(byte[] bytes) {
            return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        }

        private static boolean constantTimeEquals(String left, String right) {
            if (left == null || right == null) return false;
            byte[] a = left.getBytes(StandardCharsets.UTF_8);
            byte[] b = right.getBytes(StandardCharsets.UTF_8);
            int diff = a.length ^ b.length;
            for (int i = 0; i < Math.min(a.length, b.length); i++) {
                diff |= a[i] ^ b[i];
            }
            return diff == 0;
        }
    }
}

