import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "../components/Loader";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import {
  checkUsernameAvailability,
  getMyProfile,
  updateMyProfile
} from "../modules/profile/profileService";
import type { StreamAccountSummary } from "../services/types";

const BIO_MAX_LENGTH = 280;
const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;
const AVATAR_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ProfileFormState {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
}

type UsernameStatus = "idle" | "checking" | "available" | "unavailable" | "invalid";

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function getAvatarInitial(displayName: string, username: string) {
  return (displayName.trim() || username.trim() || "?").charAt(0).toUpperCase();
}

function isAvatarUrlValid(value: string) {
  if (!value.trim()) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ProfilePage() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState<ProfileFormState>({
    displayName: "",
    username: "",
    bio: "",
    avatarUrl: ""
  });
  const [streamAccounts, setStreamAccounts] = useState<StreamAccountSummary[]>([]);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const normalizedUsername = useMemo(() => normalizeUsername(form.username), [form.username]);
  const trimmedDisplayName = form.displayName.trim();
  const trimmedBio = form.bio.trim();
  const trimmedAvatarUrl = form.avatarUrl.trim();
  const bioCharactersLeft = BIO_MAX_LENGTH - form.bio.length;
  const avatarSource = avatarPreviewUrl || trimmedAvatarUrl;

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (trimmedDisplayName.length < 2) {
      errors.push(t("pages.profile.validation.displayName"));
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 30 || !USERNAME_PATTERN.test(normalizedUsername)) {
      errors.push(t("pages.profile.validation.username"));
    }

    if (form.bio.length > BIO_MAX_LENGTH) {
      errors.push(t("pages.profile.validation.bio", { count: BIO_MAX_LENGTH }));
    }

    if (!isAvatarUrlValid(trimmedAvatarUrl)) {
      errors.push(t("pages.profile.validation.avatarUrl"));
    }

    if (usernameStatus === "unavailable") {
      errors.push(t("pages.profile.validation.usernameUnavailable"));
    }

    return errors;
  }, [form.bio.length, normalizedUsername, t, trimmedAvatarUrl, trimmedDisplayName.length, usernameStatus]);

  const completenessItems = useMemo(
    () => [
      { label: t("pages.profile.completeness.items.displayName"), complete: trimmedDisplayName.length >= 2 },
      { label: t("pages.profile.completeness.items.username"), complete: usernameStatus === "available" },
      { label: t("pages.profile.completeness.items.bio"), complete: trimmedBio.length >= 30 },
      { label: t("pages.profile.completeness.items.avatar"), complete: Boolean(trimmedAvatarUrl || avatarPreviewUrl) },
      { label: t("pages.profile.completeness.items.streamAccounts"), complete: streamAccounts.length > 0 }
    ],
    [avatarPreviewUrl, streamAccounts.length, t, trimmedAvatarUrl, trimmedBio.length, trimmedDisplayName.length, usernameStatus]
  );
  const completedItems = completenessItems.filter((item) => item.complete).length;
  const completenessPercent = Math.round((completedItems / completenessItems.length) * 100);
  const canSubmit = validationErrors.length === 0 && usernameStatus === "available" && !isSaving;

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
        setStreamAccounts(profile.streamAccounts ?? []);
        setUsernameStatus("available");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("pages.profile.loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, [t, token]);

  useEffect(() => {
    setAvatarImageFailed(false);
  }, [avatarSource]);

  useEffect(() => {
    if (!token || isLoading) {
      return;
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 30 || !USERNAME_PATTERN.test(normalizedUsername)) {
      setUsernameStatus(normalizedUsername ? "invalid" : "idle");
      return;
    }

    let isCurrent = true;
    setUsernameStatus("checking");

    const timer = window.setTimeout(() => {
      void checkUsernameAvailability(token, normalizedUsername)
        .then((result) => {
          if (isCurrent) {
            setUsernameStatus(result.available ? "available" : "unavailable");
          }
        })
        .catch(() => {
          if (isCurrent) {
            setUsernameStatus("idle");
          }
        });
    }, 350);

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [isLoading, normalizedUsername, token]);

  function updateField(field: keyof ProfileFormState, value: string) {
    setSavedMessage("");
    setError("");
    setForm((current) => ({
      ...current,
      [field]: field === "bio" ? value.slice(0, BIO_MAX_LENGTH) : value
    }));
  }

  function handleAvatarFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!AVATAR_FILE_TYPES.includes(file.type)) {
      setError(t("pages.profile.validation.avatarFile"));
      event.target.value = "";
      return;
    }

    setError("");
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }
      return previewUrl;
    });
  }

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !canSubmit) {
      return;
    }

    setError("");
    setSavedMessage("");
    setIsSaving(true);

    try {
      const profile = await updateMyProfile(token, {
        displayName: trimmedDisplayName,
        username: normalizedUsername,
        bio: trimmedBio,
        avatarUrl: trimmedAvatarUrl
      });
      setForm({
        displayName: profile.displayName,
        username: profile.username,
        bio: profile.bio ?? "",
        avatarUrl: profile.avatarUrl ?? ""
      });
      setStreamAccounts(profile.streamAccounts ?? []);
      setAvatarPreviewUrl((currentPreviewUrl) => {
        if (currentPreviewUrl) {
          URL.revokeObjectURL(currentPreviewUrl);
        }
        return "";
      });
      setUsernameStatus("available");
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
          <div className="avatar avatar-large avatar-preview">
            {avatarSource && !avatarImageFailed ? (
              <img src={avatarSource} alt={t("pages.profile.avatarPreviewAlt")} onError={() => setAvatarImageFailed(true)} />
            ) : (
              <span>{getAvatarInitial(form.displayName, form.username)}</span>
            )}
          </div>
          <div className="profile-preview-copy">
            <h3>{form.displayName || t("pages.profile.displayName")}</h3>
            <p className="muted">@{normalizedUsername || t("pages.profile.username").toLowerCase()}</p>
          </div>
          <p>{form.bio || t("pages.profile.emptyBio")}</p>
          <div className="profile-completeness">
            <div className="profile-completeness-heading">
              <span>{t("pages.profile.completeness.title")}</span>
              <strong>{completenessPercent}%</strong>
            </div>
            <div className="profile-completeness-track" aria-hidden="true">
              <span style={{ width: `${completenessPercent}%` }} />
            </div>
            <div className="profile-checklist">
              {completenessItems.map((item) => (
                <span className={item.complete ? "is-complete" : ""} key={item.label}>
                  {item.complete ? "OK" : "--"} {item.label}
                </span>
              ))}
            </div>
          </div>
          <div className="stream-account-panel">
            <div className="stream-account-heading">
              <strong>{t("pages.profile.streamAccounts.title")}</strong>
              <span>{t("pages.profile.streamAccounts.count", { count: streamAccounts.length })}</span>
            </div>
            {streamAccounts.length ? (
              <div className="stream-account-list">
                {streamAccounts.map((account) => (
                  <a className="stream-account-item" href={account.channelUrl} key={account.id} rel="noreferrer" target="_blank">
                    <span className={`stream-platform-mark platform-${account.platform.toLowerCase()}`}>
                      {account.platform.charAt(0)}
                    </span>
                    <span>
                      <strong>{t(`pages.profile.platforms.${account.platform}`)}</strong>
                      <small>{account.platformUsername}</small>
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="muted">{t("pages.profile.streamAccounts.empty")}</p>
            )}
          </div>
        </aside>

        <div className="card form-card wide-card editor-card">
          {isLoading ? (
            <Loader label={t("pages.profile.loading")} compact />
          ) : (
            <>
              <div className="panel-heading">
                <span className="eyebrow">{t("pages.profile.editorEyebrow")}</span>
                <strong>{t("pages.profile.editorTitle")}</strong>
                <p className="muted">{t("pages.profile.editorDescription")}</p>
              </div>
              <form className="form-grid two-columns profile-edit-form" onSubmit={handleSubmit}>
                <label>
                  <span>{t("pages.profile.displayName")}</span>
                  <input
                    aria-invalid={trimmedDisplayName.length > 0 && trimmedDisplayName.length < 2}
                    placeholder={t("pages.profile.displayNamePlaceholder")}
                    disabled={isSaving}
                    value={form.displayName}
                    onChange={(event) => updateField("displayName", event.target.value)}
                  />
                  <small>{t("pages.profile.help.displayName")}</small>
                </label>
                <label>
                  <span>{t("pages.profile.username")}</span>
                  <div className="username-input-wrap">
                    <span>@</span>
                    <input
                      aria-invalid={usernameStatus === "invalid" || usernameStatus === "unavailable"}
                      placeholder={t("pages.profile.usernamePlaceholder")}
                      disabled={isSaving}
                      value={form.username}
                      onChange={(event) => updateField("username", event.target.value.toLowerCase())}
                    />
                  </div>
                  <small className={`field-hint username-status is-${usernameStatus}`}>
                    {t(`pages.profile.usernameStatus.${usernameStatus}`)}
                  </small>
                </label>
                <div className="full-width avatar-editor">
                  <label>
                    <span>{t("pages.profile.avatarUrl")}</span>
                    <input
                      aria-invalid={!isAvatarUrlValid(trimmedAvatarUrl)}
                      placeholder={t("pages.profile.avatarUrlPlaceholder")}
                      disabled={isSaving}
                      value={form.avatarUrl}
                      onChange={(event) => updateField("avatarUrl", event.target.value)}
                    />
                    <small>{t("pages.profile.help.avatarUrl")}</small>
                  </label>
                  <label className="avatar-upload-control">
                    <span>{t("pages.profile.avatarUpload")}</span>
                    <input
                      accept={AVATAR_FILE_TYPES.join(",")}
                      disabled={isSaving}
                      type="file"
                      onChange={handleAvatarFileChange}
                    />
                    <small>{t("pages.profile.help.avatarUpload")}</small>
                  </label>
                </div>
                <label className="full-width">
                  <span>{t("pages.profile.bio")}</span>
                  <textarea
                    disabled={isSaving}
                    maxLength={BIO_MAX_LENGTH}
                    rows={5}
                    value={form.bio}
                    onChange={(event) => updateField("bio", event.target.value)}
                  />
                  <small className={bioCharactersLeft < 30 ? "field-hint is-warning" : "field-hint"}>
                    {t("pages.profile.bioCounter", { count: bioCharactersLeft })}
                  </small>
                </label>
                {validationErrors.length ? (
                  <div className="full-width validation-list" role="alert">
                    {validationErrors.map((validationError) => (
                      <span key={validationError}>{validationError}</span>
                    ))}
                  </div>
                ) : null}
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
                <div className="form-actions full-width">
                  <button className="button" disabled={!canSubmit} type="submit">
                    {isSaving ? t("common.actions.saving") : t("common.actions.save")}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
