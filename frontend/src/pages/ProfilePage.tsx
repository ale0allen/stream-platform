import { useEffect, useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
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
        title="Edit profile"
        description="Manage the public information shown to other users on the platform."
      />

      <div className="card form-card wide-card">
        {isLoading ? (
          <div className="state-card compact-state">Loading profile...</div>
        ) : (
          <form className="form-grid two-columns" onSubmit={handleSubmit}>
            <label>
              <span>Display name</span>
              <input
                disabled={isSaving}
                value={form.displayName}
                onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
              />
            </label>
            <label>
              <span>Username</span>
              <input
                disabled={isSaving}
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              />
            </label>
            <label className="full-width">
              <span>Avatar URL</span>
              <input
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
            {error ? <div className="form-error full-width">{error}</div> : null}
            {savedMessage ? <div className="form-success full-width">{savedMessage}</div> : null}
            <button className="button" disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
