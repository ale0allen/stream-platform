package br.com.streamplatform.profile.model;

import br.com.streamplatform.common.entity.BaseTimeEntity;
import br.com.streamplatform.user.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "profiles")
public class Profile extends BaseTimeEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 100)
    private String displayName;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 500)
    private String avatarUrl;

    protected Profile() {
    }

    public Profile(User user, String displayName, String username, String bio, String avatarUrl) {
        this.user = user;
        this.displayName = displayName;
        this.username = username;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
    }

    public UUID getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getUsername() {
        return username;
    }

    public String getBio() {
        return bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void update(String displayName, String username, String bio, String avatarUrl) {
        this.displayName = displayName;
        this.username = username;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
    }
}
