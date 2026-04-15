import { useTranslation } from "react-i18next";
import type { Profile } from "../services/types";

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const { t } = useTranslation();

  return (
    <article className="card profile-card">
      <div className="avatar">{profile.displayName.charAt(0).toUpperCase()}</div>
      <div className="profile-card-body">
        <div className="profile-card-heading">
          <div className="profile-card-copy">
            <h3>{profile.displayName}</h3>
            <p className="muted">{t("profileCard.usernamePrefix", { username: profile.username })}</p>
          </div>
          <span className="profile-tag">{t("profileCard.tag")}</span>
        </div>
        <p>{profile.bio || t("profileCard.emptyBio")}</p>
        <div className="profile-meta">
          <span>{t("profileCard.metaPublic")}</span>
          <span>{t("profileCard.metaShortlist")}</span>
        </div>
      </div>
    </article>
  );
}
