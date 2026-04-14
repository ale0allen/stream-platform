package br.com.streamplatform.auth.service;

import br.com.streamplatform.audit.service.AuditLogService;
import br.com.streamplatform.auth.dto.AuthResponse;
import br.com.streamplatform.auth.dto.LoginRequest;
import br.com.streamplatform.auth.dto.RegisterRequest;
import br.com.streamplatform.auth.model.AuthenticatedUser;
import br.com.streamplatform.common.exception.BusinessException;
import br.com.streamplatform.profile.model.Profile;
import br.com.streamplatform.profile.repository.ProfileRepository;
import br.com.streamplatform.user.model.Role;
import br.com.streamplatform.user.model.User;
import br.com.streamplatform.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    public AuthService(
            UserRepository userRepository,
            ProfileRepository profileRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            AuditLogService auditLogService
    ) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        String username = request.username().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(HttpStatus.CONFLICT, "Email is already in use");
        }
        if (profileRepository.existsByUsername(username)) {
            throw new BusinessException(HttpStatus.CONFLICT, "Username is already in use");
        }

        User user = userRepository.save(new User(
                email,
                passwordEncoder.encode(request.password()),
                Role.USER,
                true
        ));

        profileRepository.save(new Profile(
                user,
                request.displayName().trim(),
                username,
                null,
                null
        ));

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(user);
        String token = generateAccessToken(user, authenticatedUser);
        auditLogService.log(user.getId(), "USER_REGISTERED", "User", user.getId().toString());

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email().trim().toLowerCase(),
                            request.password()
                    )
            );
        } catch (AuthenticationException exception) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        AuthenticatedUser authenticatedUser = (AuthenticatedUser) authentication.getPrincipal();
        User user = authenticatedUser.getUser();
        String token = generateAccessToken(user, authenticatedUser);
        auditLogService.log(user.getId(), "USER_LOGGED_IN", "User", user.getId().toString());

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole());
    }

    private String generateAccessToken(User user, AuthenticatedUser authenticatedUser) {
        return jwtService.generateToken(authenticatedUser, Map.of(
                "role", user.getRole().name(),
                "userId", user.getId().toString()
        ));
    }
}
