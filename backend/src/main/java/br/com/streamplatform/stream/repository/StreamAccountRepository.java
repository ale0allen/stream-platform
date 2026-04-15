package br.com.streamplatform.stream.repository;

import br.com.streamplatform.stream.model.StreamAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StreamAccountRepository extends JpaRepository<StreamAccount, UUID> {

    List<StreamAccount> findByUserIdOrderByPlatformAsc(UUID userId);

    boolean existsByUserIdAndPlatformAndPlatformUsernameIgnoreCase(UUID userId, br.com.streamplatform.stream.model.StreamPlatformType platform, String platformUsername);

    void deleteByIdAndUserId(UUID id, UUID userId);
}
