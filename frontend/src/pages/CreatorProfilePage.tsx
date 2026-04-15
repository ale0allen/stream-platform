import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import { listProfiles } from "../modules/discovery/discoveryService";
import type { Profile } from "../services/types";

export function CreatorProfilePage() {
  const { token } = useAuth();
  const { profileId } = useParams();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !profileId) {
      setIsLoading(false);
      return;
    }

    const authToken = token;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setError("");
        const profiles = await listProfiles(authToken, "");
        setProfile(profiles.find((item) => item.id === profileId) ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("pages.creatorProfile.loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, [profileId, t, token]);

  return (
    <section className="page">
      <SectionHeader
        eyebrow={t("pages.creatorProfile.eyebrow")}
        title={profile?.displayName ?? t("pages.creatorProfile.title")}
        description={t("pages.creatorProfile.description")}
        badge={t("pages.creatorProfile.badge")}
      />

      {error ? <StatusMessage tone="error" message={error} /> : null}

      {isLoading ? <Loader label={t("pages.creatorProfile.loading")} /> : null}

      {!isLoading && !error && !profile ? (
        <EmptyState
          title={t("pages.creatorProfile.emptyTitle")}
          description={t("pages.creatorProfile.emptyDescription")}
          action={
            <Link className="button" to="/favorites">
              {t("pages.creatorProfile.backToFavorites")}
            </Link>
          }
        />
      ) : null}

      {!isLoading && !error && profile ? (
        <article className="card creator-profile-card">
          <div className="creator-profile-hero">
            <Avatar
              alt={profile.displayName}
              className="avatar-large"
              imageUrl={profile.avatarUrl}
              label={profile.displayName || profile.username}
            />
            <div>
              <h2>{profile.displayName}</h2>
              <p className="muted">@{profile.username}</p>
            </div>
          </div>
          <p className="creator-profile-bio">{profile.bio || t("profileCard.emptyBio")}</p>
          <div className="stream-account-list">
            {profile.streamAccounts.length ? (
              profile.streamAccounts.map((account) => (
                <a className="stream-account-item" href={account.channelUrl} key={account.id} rel="noreferrer" target="_blank">
                  <span className={`stream-platform-mark platform-${account.platform.toLowerCase()}`}>
                    {account.platform.charAt(0)}
                  </span>
                  <span>
                    <strong>{t(`pages.profile.platforms.${account.platform}`)}</strong>
                    <small>{account.platformUsername}</small>
                  </span>
                </a>
              ))
            ) : (
              <p className="muted">{t("pages.creatorProfile.noLinkedAccount")}</p>
            )}
          </div>
        </article>
      ) : null}
    </section>
  );
}
