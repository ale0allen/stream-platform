package br.com.streamplatform.user.service;

import br.com.streamplatform.auth.model.AuthenticatedUser;
import br.com.streamplatform.common.exception.BusinessException;
import br.com.streamplatform.user.dto.UserMeResponse;
import br.com.streamplatform.user.model.User;
import br.com.streamplatform.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserMeResponse getCurrentUser(AuthenticatedUser authenticatedUser) {
        User user = userRepository.findById(authenticatedUser.getId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "User not found"));

        return new UserMeResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
