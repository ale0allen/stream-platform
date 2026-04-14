import { useEffect, useState } from "react";
import { Loader } from "../components/Loader";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import { getMyProfile, updateMyProfile } from "../modules/profile/profileService";

export function ProfilePage() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    bio: "",
    avatarUrl: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const authToken = token;

    async function loadProfile() {
      try {
        setError("");
        const profile = await getMyProfile(authToken);
        setForm({
          displayName: profile.displayName,
          username: profile.username,
          bio: profile.bio ?? "",
          avatarUrl: profile.avatarUrl ?? ""
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load profile");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || isSaving) {
      return;
    }

    setError("");
    setSavedMessage("");
    setIsSaving(true);

    try {
      const profile = await updateMyProfile(token, form);
      setForm({
        displayName: profile.displayName,
        username: profile.username,
        bio: profile.bio ?? "",
        avatarUrl: profile.avatarUrl ?? ""
      });
      setSavedMessage("Profile updated successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="page">
      <SectionHeader
        eyebrow="Profile"
        title="Shape the creator profile"
        description="Manage the public information shown across discovery and favorites."
        badge="Public-facing"
      />

      <div className="page-grid page-grid-profile">
        <aside className="card profile-preview-card">
          <span className="eyebrow">Preview</span>
          <div className="avatar avatar-large">{form.displayName.charAt(0).toUpperCase() || "?"}</div>
          <div>
            <h3>{form.displayName || "Display name"}</h3>
            <p className="muted">@{form.username || "username"}</p>
          </div>
          <p>{form.bio || "Add a short creator bio to improve discovery quality and profile clarity."}</p>
          <div className="profile-preview-meta">
            <span>{form.avatarUrl ? "Avatar URL added" : "No avatar URL yet"}</span>
            <span>Discovery ready</span>
          </div>
        </aside>

        <div className="card form-card wide-card">
          {isLoading ? (
            <Loader label="Loading profile..." compact />
          ) : (
            <form className="form-grid two-columns" onSubmit={handleSubmit}>
              <label>
                <span>Display name</span>
                <input
                  placeholder="Display name"
                  disabled={isSaving}
                  value={form.displayName}
                  onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                />
              </label>
              <label>
                <span>Username</span>
                <input
                  placeholder="Username"
                  disabled={isSaving}
                  value={form.username}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                />
              </label>
              <label className="full-width">
                <span>Avatar URL</span>
                <input
                  placeholder="https://..."
                  disabled={isSaving}
                  value={form.avatarUrl}
                  onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                />
              </label>
              <label className="full-width">
                <span>Bio</span>
                <textarea
                  disabled={isSaving}
                  rows={5}
                  value={form.bio}
                  onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                />
              </label>
              {error ? (
                <div className="full-width">
                  <StatusMessage tone="error" message={error} />
                </div>
              ) : null}
              {savedMessage ? (
                <div className="full-width">
                  <StatusMessage tone="success" message={savedMessage} />
                </div>
              ) : null}
              <button className="button" disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
