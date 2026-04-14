package br.com.streamplatform.favorite.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "favorites")
public class Favorite {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID profileId;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Favorite() {
    }

    public Favorite(UUID userId, UUID profileId) {
        this.userId = userId;
        this.profileId = profileId;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getProfileId() {
        return profileId;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
