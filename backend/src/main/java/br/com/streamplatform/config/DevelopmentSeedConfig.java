package br.com.streamplatform.config;

import br.com.streamplatform.favorite.model.Favorite;
import br.com.streamplatform.favorite.repository.FavoriteRepository;
import br.com.streamplatform.profile.repository.ProfileRepository;
import br.com.streamplatform.user.model.Role;
import br.com.streamplatform.user.model.User;
import br.com.streamplatform.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("dev")
public class DevelopmentSeedConfig {

    @Bean
    public CommandLineRunner developmentSeedRunner(
            UserRepository userRepository,
            ProfileRepository profileRepository,
            FavoriteRepository favoriteRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            User adminUser = upsertUser(
                    userRepository,
                    "admin@streamplatform.local",
                    "admin12345",
                    Role.ADMIN,
                    passwordEncoder
            );
            User userOne = upsertUser(
                    userRepository,
                    "luna@streamplatform.local",
                    "user12345",
                    Role.USER,
                    passwordEncoder
            );
            User userTwo = upsertUser(
                    userRepository,
                    "pixel@streamplatform.local",
                    "user12345",
                    Role.USER,
                    passwordEncoder
            );

            br.com.streamplatform.profile.model.Profile adminProfile = upsertProfile(
                    profileRepository,
                    adminUser,
                    "Admin Ops",
                    "adminops",
                    "Platform administrator account for local development.",
                    "https://images.example.com/admin-avatar.png"
            );
            br.com.streamplatform.profile.model.Profile userOneProfile = upsertProfile(
                    profileRepository,
                    userOne,
                    "Luna Streams",
                    "lunastreams",
                    "Variety streamer focused on community nights and reviews.",
                    "https://images.example.com/luna-avatar.png"
            );
            br.com.streamplatform.profile.model.Profile userTwoProfile = upsertProfile(
                    profileRepository,
                    userTwo,
                    "Pixel Forge",
                    "pixelforge",
                    "Indie dev streams and launch day breakdowns.",
                    "https://images.example.com/pixel-avatar.png"
            );

            createFavoriteIfMissing(favoriteRepository, adminUser, userOneProfile);
            createFavoriteIfMissing(favoriteRepository, userOne, userTwoProfile);
            createFavoriteIfMissing(favoriteRepository, userTwo, userOneProfile);
        };
    }

    private User upsertUser(
            UserRepository userRepository,
            String email,
            String rawPassword,
            Role role,
            PasswordEncoder passwordEncoder
    ) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(new User(
                        email,
                        passwordEncoder.encode(rawPassword),
                        role,
                        true
                )));
    }

    private br.com.streamplatform.profile.model.Profile upsertProfile(
            ProfileRepository profileRepository,
            User user,
            String displayName,
            String username,
            String bio,
            String avatarUrl
    ) {
        return profileRepository.findByUserId(user.getId())
                .orElseGet(() -> profileRepository.save(new br.com.streamplatform.profile.model.Profile(
                        user,
                        displayName,
                        username,
                        bio,
                        avatarUrl
                )));
    }

    private void createFavoriteIfMissing(
            FavoriteRepository favoriteRepository,
            User user,
            br.com.streamplatform.profile.model.Profile profile
    ) {
        if (!favoriteRepository.existsByUserIdAndProfileId(user.getId(), profile.getId())) {
            favoriteRepository.save(new Favorite(user.getId(), profile.getId()));
        }
    }
}
