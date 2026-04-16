import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import { addFavorite, listFavorites } from "../modules/favorite/favoriteService";
import { getPublicProfile, type PublicProfile } from "../modules/publicProfile/publicProfileService";

function getCleanChannelLabel(channelUrl: string) {
  try {
    const parsed = new URL(channelUrl);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/+$/, "");
    const compactPath = path.length > 24 ? `${path.slice(0, 24)}…` : path;
    return `${host}${compactPath}`;
  } catch {
    return channelUrl;
  }
}

export function PublicProfilePage() {
  const { username } = useParams();
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [error, setError] = useState("");
  const [favoriteFeedback, setFavoriteFeedback] = useState("");

  useEffect(() => {
    if (!username) {
      setIsLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        setIsLoading(true);
        setError("");
        setProfile(await getPublicProfile(username ?? ""));
      } catch (loadError) {
        setProfile(null);
        setError(loadError instanceof Error ? loadError.message : t("pages.publicProfile.loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, [t, username]);

  useEffect(() => {
    if (!token || !profile) {
      setIsFavorite(false);
      return;
    }

    const favoriteToken = token;
    const profileId = profile.profileId;

    async function loadFavoriteState() {
      try {
        const favorites = await listFavorites(favoriteToken);
        setIsFavorite(favorites.some((favorite) => favorite.profileId === profileId));
      } catch {
        setIsFavorite(false);
      }
    }

    void loadFavoriteState();
  }, [profile, token]);

  async function handleFavorite() {
    if (!token || !profile || isFavorite || isFavoriteLoading) {
      return;
    }

    try {
      setIsFavoriteLoading(true);
      setFavoriteFeedback("");
      setError("");
      await addFavorite(token, profile.profileId);
      setIsFavorite(true);
      setFavoriteFeedback(t("pages.publicProfile.favoriteSuccess"));
    } catch (favoriteError) {
      setError(favoriteError instanceof Error ? favoriteError.message : t("pages.publicProfile.favoriteError"));
    } finally {
      setIsFavoriteLoading(false);
    }
  }

  return (
    <main className="public-profile-shell">
      <header className="public-profile-topbar">
        <Link to="/" className="brand auth-brand">
          <span className="brand-mark brand-mark-small">SP</span>
          <span className="brand-title">{t("common.brand")}</span>
        </Link>
        {isAuthenticated ? (
          <Link className="button button-secondary" to="/discovery">
            {t("pages.publicProfile.backToApp")}
          </Link>
        ) : (
          <Link className="button button-secondary" to="/login">
            {t("pages.publicProfile.login")}
          </Link>
        )}
      </header>

      {isLoading ? <Loader label={t("pages.publicProfile.loading")} /> : null}

      {!isLoading && error && !profile ? (
        <EmptyState title={t("pages.publicProfile.notFoundTitle")} description={t("pages.publicProfile.notFoundDescription")} />
      ) : null}

      {!isLoading && profile ? (
        <article className="card public-profile-card">
          <div className="public-profile-hero">
            <Avatar
              alt={profile.displayName}
              className="public-profile-avatar"
              imageUrl={profile.avatarUrl}
              label={profile.displayName || profile.username}
            />
            <div className="public-profile-copy">
              <span className="eyebrow">{t("pages.publicProfile.eyebrow")}</span>
              <h1>{profile.displayName}</h1>
              <p className="muted">@{profile.username}</p>
              <p>{profile.bio || t("profileCard.emptyBio")}</p>
              {!isAuthLoading && isAuthenticated ? (
                <button className="button public-profile-favorite" disabled={isFavorite || isFavoriteLoading} onClick={() => void handleFavorite()} type="button">
                  {isFavoriteLoading
                    ? t("common.actions.adding")
                    : isFavorite
                      ? t("pages.publicProfile.alreadyFavorite")
                      : t("pages.publicProfile.favorite")}
                </button>
              ) : null}
              {favoriteFeedback ? <StatusMessage tone="success" message={favoriteFeedback} /> : null}
              {error ? <StatusMessage tone="error" message={error} /> : null}
            </div>
          </div>

          <section className="public-platform-section">
            <div className="panel-heading">
              <span className="eyebrow">{t("pages.publicProfile.platformEyebrow")}</span>
              <strong>{t("pages.publicProfile.platformTitle")}</strong>
            </div>
            {profile.streamAccounts.length ? (
              <div className="public-platform-grid">
                {profile.streamAccounts.map((account) => (
                  <a className="public-platform-card" href={account.channelUrl} key={account.id} rel="noreferrer" target="_blank">
                    <span className={`stream-platform-mark platform-${account.platform.toLowerCase()}`}>
                      {account.platform.charAt(0)}
                    </span>
                    <span className="public-platform-copy">
                      <strong>{t(`pages.profile.platforms.${account.platform}`)}</strong>
                      <small>@{account.platformUsername}</small>
                      <small className="public-platform-url">{getCleanChannelLabel(account.channelUrl)}</small>
                    </span>
                    <span className="public-platform-cta">
                      {t("pages.publicProfile.openChannel")}
                      <span className="public-platform-cta-icon" aria-hidden="true">
                        ↗
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="state-card compact-state public-platform-empty">
                <p className="muted">{t("pages.publicProfile.noLinkedAccounts")}</p>
              </div>
            )}
          </section>
        </article>
      ) : null}
    </main>
  );
}
