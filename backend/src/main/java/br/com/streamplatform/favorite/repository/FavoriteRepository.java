package br.com.streamplatform.favorite.repository;

import br.com.streamplatform.favorite.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FavoriteRepository extends JpaRepository<Favorite, UUID> {

    boolean existsByUserIdAndProfileId(UUID userId, UUID profileId);

    List<Favorite> findByUserIdOrderByCreatedAtDesc(UUID userId);

    void deleteByUserIdAndProfileId(UUID userId, UUID profileId);
}
