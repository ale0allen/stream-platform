import type { Profile } from "../services/types";

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <article className="card profile-card">
      <div className="avatar">{profile.displayName.charAt(0).toUpperCase()}</div>
      <div className="profile-card-body">
        <div className="profile-card-heading">
          <div>
            <h3>{profile.displayName}</h3>
            <p className="muted">@{profile.username}</p>
          </div>
          <span className="profile-tag">Creator</span>
        </div>
        <p>{profile.bio || "Streamer profile without bio yet."}</p>
        <div className="profile-meta">
          <span>Public profile</span>
          <span>Ready for shortlist</span>
        </div>
      </div>
    </article>
  );
}
