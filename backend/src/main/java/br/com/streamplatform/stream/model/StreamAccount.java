package br.com.streamplatform.stream.model;

import br.com.streamplatform.common.entity.BaseTimeEntity;
import br.com.streamplatform.user.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "stream_accounts")
public class StreamAccount extends BaseTimeEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StreamPlatformType platform;

    @Column(nullable = false, length = 100)
    private String platformUserId;

    @Column(nullable = false, length = 100)
    private String platformUsername;

    @Column(nullable = false, length = 500)
    private String channelUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StreamAccountConnectionType connectionType;

    protected StreamAccount() {
    }

    public StreamAccount(
            User user,
            StreamPlatformType platform,
            String platformUserId,
            String platformUsername,
            String channelUrl,
            StreamAccountConnectionType connectionType
    ) {
        this.user = user;
        this.platform = platform;
        this.platformUserId = platformUserId;
        this.platformUsername = platformUsername;
        this.channelUrl = channelUrl;
        this.connectionType = connectionType;
    }

    public UUID getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public StreamPlatformType getPlatform() {
        return platform;
    }

    public String getPlatformUserId() {
        return platformUserId;
    }

    public String getPlatformUsername() {
        return platformUsername;
    }

    public String getChannelUrl() {
        return channelUrl;
    }

    public StreamAccountConnectionType getConnectionType() {
        return connectionType;
    }

    public void updateOauthIdentity(String platformUserId, String platformUsername, String channelUrl) {
        this.platformUserId = platformUserId;
        this.platformUsername = platformUsername;
        this.channelUrl = channelUrl;
        this.connectionType = StreamAccountConnectionType.OAUTH;
    }
}
