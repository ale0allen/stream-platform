package br.com.streamplatform.auth.service;

import br.com.streamplatform.auth.model.AuthenticatedUser;
import br.com.streamplatform.common.exception.BusinessException;
import br.com.streamplatform.user.model.User;
import br.com.streamplatform.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class StreamUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public StreamUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByEmail(username.trim().toLowerCase())
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "error.auth.invalidCredentials"));
        return new AuthenticatedUser(user);
    }
}
