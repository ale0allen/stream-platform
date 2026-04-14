package br.com.streamplatform.profile.repository;

import br.com.streamplatform.profile.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    boolean existsByUsername(String username);

    boolean existsByUsernameAndUserIdNot(String username, UUID userId);

    Optional<Profile> findByUserId(UUID userId);

    List<Profile> findByDisplayNameContainingIgnoreCaseOrUsernameContainingIgnoreCaseOrderByDisplayNameAsc(
            String displayName,
            String username
    );
}
