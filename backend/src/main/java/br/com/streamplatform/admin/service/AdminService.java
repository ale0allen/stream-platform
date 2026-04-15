package br.com.streamplatform.admin.service;

import br.com.streamplatform.admin.dto.AdminUserResponse;
import br.com.streamplatform.common.exception.BusinessException;
import br.com.streamplatform.profile.repository.ProfileRepository;
import br.com.streamplatform.user.model.User;
import br.com.streamplatform.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    public AdminService(UserRepository userRepository, ProfileRepository profileRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    public List<AdminUserResponse> listUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapUser)
                .toList();
    }

    @Transactional
    public AdminUserResponse updateUserStatus(UUID userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "error.user.notFound"));

        user.updateActive(active);
        return mapUser(user);
    }

    private AdminUserResponse mapUser(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                profileRepository.findByUserId(user.getId()).map(profile -> profile.getUsername()).orElse(""),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
