import { useTranslation } from "react-i18next";
import { Avatar } from "./Avatar";
import type { Profile, StreamPlatformType } from "../services/types";

type PlatformFilter = "ALL" | Extract<StreamPlatformType, "TWITCH" | "YOUTUBE" | "KICK">;

const PLATFORM_BADGE_LIMIT = 4;

function getPrimaryPlatform(profile: Profile, selectedPlatform: PlatformFilter) {
  if (selectedPlatform !== "ALL") {
    return profile.streamAccounts.find((account) => account.platform === selectedPlatform);
  }

  return profile.streamAccounts.find((account) => account.platform !== "OTHER") ?? profile.streamAccounts[0];
}

export function CreatorDiscoveryCard({
  profile,
  platformFilter,
  isFavorite,
  isMutating,
  isAnyMutating,
  onOpenPublicProfile,
  onToggleFavorite
}: {
  profile: Profile;
  platformFilter: PlatformFilter;
  isFavorite: boolean;
  isMutating: boolean;
  isAnyMutating: boolean;
  onOpenPublicProfile: (username: string) => void;
  onToggleFavorite: (profileId: string) => void;
}) {
  const { t } = useTranslation();

  const primaryPlatform = getPrimaryPlatform(profile, platformFilter);
  const visibleBadges = profile.streamAccounts.slice(0, PLATFORM_BADGE_LIMIT);
  const remainingBadges = Math.max(0, profile.streamAccounts.length - visibleBadges.length);

  return (
    <article
      className="card discovery-card is-clickable"
      key={profile.id}
      role="link"
      tabIndex={0}
      onClick={() => onOpenPublicProfile(profile.username)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenPublicProfile(profile.username);
        }
      }}
    >
      <div className="discovery-card-header">
        <Avatar
          alt={profile.displayName}
          className="discovery-avatar"
          imageUrl={profile.avatarUrl}
          label={profile.displayName || profile.username}
        />
        <div className="discovery-card-title">
          <h3>{profile.displayName}</h3>
          <p className="muted">@{profile.username}</p>
        </div>
        <span className="open-profile-indicator" aria-hidden="true">
          {t("pages.discovery.openProfileShort")}
          <span className="open-profile-chevron">›</span>
        </span>
      </div>

      <div className="discovery-platform-row">
        {profile.streamAccounts.length ? (
          <>
            {visibleBadges.map((account) => (
              <span className={`platform-badge platform-${account.platform.toLowerCase()}`} key={account.id}>
                {t(`pages.profile.platforms.${account.platform}`)}
              </span>
            ))}
            {remainingBadges ? (
              <span
                className="platform-badge platform-overflow"
                aria-label={t("pages.discovery.morePlatforms", { count: remainingBadges })}
              >
                +{remainingBadges}
              </span>
            ) : null}
          </>
        ) : (
          <span className="platform-badge">{t("pages.discovery.noPlatform")}</span>
        )}
      </div>

      <p className="discovery-card-bio">{profile.bio || t("profileCard.emptyBio")}</p>

      <div className="discovery-card-footer">
        {primaryPlatform ? (
          <a
            className="discovery-primary-channel"
            href={primaryPlatform.channelUrl}
            rel="noreferrer"
            target="_blank"
            onClick={(event) => event.stopPropagation()}
          >
            <span className={`stream-platform-mark platform-${primaryPlatform.platform.toLowerCase()}`} aria-hidden="true">
              {primaryPlatform.platform.charAt(0)}
            </span>
            <span className="discovery-primary-channel-copy">
              <strong>{primaryPlatform.platformUsername}</strong>
              <small>{t(`pages.profile.platforms.${primaryPlatform.platform}`)}</small>
            </span>
            <span className="discovery-primary-channel-cta" aria-hidden="true">
              {t("pages.publicProfile.openChannel")}
            </span>
          </a>
        ) : (
          <span>{t("pages.discovery.noLinkedAccount")}</span>
        )}

        <button
          className="button button-secondary open-profile-button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenPublicProfile(profile.username);
          }}
          type="button"
        >
          {t("pages.discovery.openProfile")}
        </button>

        <button
          className={isFavorite ? "button button-secondary favorite-toggle is-active" : "button button-secondary favorite-toggle"}
          disabled={isMutating || isAnyMutating}
          aria-pressed={isFavorite}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(profile.id);
          }}
          type="button"
        >
          {isMutating
            ? t("pages.discovery.favoriteToggle.loading")
            : isFavorite
              ? t("pages.discovery.favoriteToggle.remove")
              : t("pages.discovery.favoriteToggle.add")}
        </button>
      </div>
    </article>
  );
}

