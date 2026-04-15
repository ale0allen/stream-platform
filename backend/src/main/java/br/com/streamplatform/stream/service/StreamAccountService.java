package br.com.streamplatform.stream.service;

import br.com.streamplatform.common.exception.BusinessException;
import br.com.streamplatform.profile.dto.StreamAccountSummaryResponse;
import br.com.streamplatform.stream.dto.CreateStreamAccountRequest;
import br.com.streamplatform.stream.model.StreamAccount;
import br.com.streamplatform.stream.model.StreamPlatformType;
import br.com.streamplatform.stream.repository.StreamAccountRepository;
import br.com.streamplatform.user.model.User;
import br.com.streamplatform.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Service
public class StreamAccountService {

    private final StreamAccountRepository streamAccountRepository;
    private final UserRepository userRepository;

    public StreamAccountService(StreamAccountRepository streamAccountRepository, UserRepository userRepository) {
        this.streamAccountRepository = streamAccountRepository;
        this.userRepository = userRepository;
    }

    public List<StreamAccountSummaryResponse> listCurrentUserAccounts(UUID userId) {
        return streamAccountRepository.findByUserIdOrderByPlatformAsc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public StreamAccountSummaryResponse addCurrentUserAccount(UUID userId, CreateStreamAccountRequest request) {
        StreamPlatformType platform = request.platform();

        if (platform == StreamPlatformType.OTHER) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "error.streamAccount.platformUnsupported");
        }

        String username = request.username().trim();
        String channelUrl = request.url().trim();
        validateChannelUrl(channelUrl);

        if (streamAccountRepository.existsByUserIdAndPlatformAndPlatformUsernameIgnoreCase(userId, platform, username)) {
            throw new BusinessException(HttpStatus.CONFLICT, "error.streamAccount.alreadyExists");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "error.user.notFound"));
        StreamAccount streamAccount = streamAccountRepository.save(new StreamAccount(
                user,
                platform,
                platform.name().toLowerCase() + ":" + username.toLowerCase(),
                username,
                channelUrl
        ));

        return toResponse(streamAccount);
    }

    @Transactional
    public void removeCurrentUserAccount(UUID userId, UUID accountId) {
        StreamAccount streamAccount = streamAccountRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "error.streamAccount.notFound"));

        if (!streamAccount.getUser().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "error.streamAccount.notFound");
        }

        streamAccountRepository.deleteByIdAndUserId(accountId, userId);
    }

    private StreamAccountSummaryResponse toResponse(StreamAccount streamAccount) {
        return new StreamAccountSummaryResponse(
                streamAccount.getId(),
                streamAccount.getPlatform(),
                streamAccount.getPlatformUsername(),
                streamAccount.getChannelUrl()
        );
    }

    private void validateChannelUrl(String channelUrl) {
        try {
            URI uri = URI.create(channelUrl);
            if (!"http".equalsIgnoreCase(uri.getScheme()) && !"https".equalsIgnoreCase(uri.getScheme())) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException exception) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "error.streamAccount.invalidUrl");
        }
    }
}
