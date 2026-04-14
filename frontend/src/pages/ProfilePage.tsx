import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "../components/Loader";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import { getMyProfile, updateMyProfile } from "../modules/profile/profileService";

export function ProfilePage() {
  const { token } = useAuth();
  const { t } = useTranslation();
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
        setError(loadError instanceof Error ? loadError.message : t("pages.profile.loadError"));
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
      setSavedMessage(t("pages.profile.saveSuccess"));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("pages.profile.saveError"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="page">
      <SectionHeader
        eyebrow={t("pages.profile.eyebrow")}
        title={t("pages.profile.title")}
        description={t("pages.profile.description")}
        badge={t("pages.profile.badge")}
      />

      <div className="page-grid page-grid-profile">
        <aside className="card profile-preview-card">
          <span className="eyebrow">{t("pages.profile.previewEyebrow")}</span>
          <div className="avatar avatar-large">{form.displayName.charAt(0).toUpperCase() || "?"}</div>
          <div>
            <h3>{form.displayName || t("pages.profile.displayName")}</h3>
            <p className="muted">@{form.username || t("pages.profile.username").toLowerCase()}</p>
          </div>
          <p>{form.bio || t("pages.profile.emptyBio")}</p>
          <div className="profile-preview-meta">
            <span>{form.avatarUrl ? t("pages.profile.avatarAdded") : t("pages.profile.avatarMissing")}</span>
            <span>{t("pages.profile.discoveryReady")}</span>
          </div>
        </aside>

        <div className="card form-card wide-card">
          {isLoading ? (
            <Loader label={t("pages.profile.loading")} compact />
          ) : (
            <form className="form-grid two-columns" onSubmit={handleSubmit}>
              <label>
                <span>{t("pages.profile.displayName")}</span>
                <input
                  placeholder={t("pages.profile.displayNamePlaceholder")}
                  disabled={isSaving}
                  value={form.displayName}
                  onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                />
              </label>
              <label>
                <span>{t("pages.profile.username")}</span>
                <input
                  placeholder={t("pages.profile.usernamePlaceholder")}
                  disabled={isSaving}
                  value={form.username}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                />
              </label>
              <label className="full-width">
                <span>{t("pages.profile.avatarUrl")}</span>
                <input
                  placeholder={t("pages.profile.avatarUrlPlaceholder")}
                  disabled={isSaving}
                  value={form.avatarUrl}
                  onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                />
              </label>
              <label className="full-width">
                <span>{t("pages.profile.bio")}</span>
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
                {isSaving ? t("common.actions.saving") : t("common.actions.save")}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
