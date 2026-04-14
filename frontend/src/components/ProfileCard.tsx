import type { Profile } from "../services/types";

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <article className="card profile-card">
      <div className="avatar">{profile.displayName.charAt(0).toUpperCase()}</div>
      <div>
        <h3>{profile.displayName}</h3>
        <p className="muted">@{profile.username}</p>
        <p>{profile.bio || "Streamer profile without bio yet."}</p>
      </div>
    </article>
  );
}
