import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "../components/Avatar";
import { Loader } from "../components/Loader";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import {
  checkUsernameAvailability,
  getMyProfile,
  updateMyProfile
} from "../modules/profile/profileService";
import {
  addStreamAccount,
  listStreamAccounts,
  removeStreamAccount
} from "../modules/streamAccount/streamAccountService";
import type { StreamAccountSummary, StreamPlatformType } from "../services/types";

const BIO_MAX_LENGTH = 280;
const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;
const STREAM_USERNAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const AVATAR_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const STREAM_PLATFORMS: Array<Exclude<StreamPlatformType, "OTHER">> = ["TWITCH", "YOUTUBE", "KICK"];

interface ProfileFormState {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
}

interface StreamAccountFormState {
  platform: Exclude<StreamPlatformType, "OTHER">;
  username: string;
  url: string;
}

type UsernameStatus = "idle" | "checking" | "available" | "unavailable" | "invalid";
type ProfileField = keyof ProfileFormState;

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
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
  const [streamForm, setStreamForm] = useState<StreamAccountFormState>({
    platform: "TWITCH",
    username: "",
    url: ""
  });
  const [streamAccounts, setStreamAccounts] = useState<StreamAccountSummary[]>([]);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<ProfileField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isStreamAccountLoading, setIsStreamAccountLoading] = useState(false);
  const [isAddingStreamAccount, setIsAddingStreamAccount] = useState(false);
  const [removingStreamAccountId, setRemovingStreamAccountId] = useState("");
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [streamAccountFeedback, setStreamAccountFeedback] = useState("");

  const normalizedUsername = useMemo(() => normalizeUsername(form.username), [form.username]);
  const trimmedDisplayName = form.displayName.trim();
  const trimmedBio = form.bio.trim();
  const trimmedAvatarUrl = form.avatarUrl.trim();
  const bioCharactersLeft = BIO_MAX_LENGTH - form.bio.length;
  const avatarSource = avatarPreviewUrl || trimmedAvatarUrl;
  const isDisplayNameInvalid = trimmedDisplayName.length < 2;
  const isUsernameFormatInvalid =
    normalizedUsername.length < 3 || normalizedUsername.length > 30 || !USERNAME_PATTERN.test(normalizedUsername);
  const isUsernameUnavailable = usernameStatus === "unavailable";
  const isUsernameInvalid = isUsernameFormatInvalid || isUsernameUnavailable;
  const isBioInvalid = form.bio.length > BIO_MAX_LENGTH;
  const isAvatarUrlInvalid = !isAvatarUrlValid(trimmedAvatarUrl);
  const shouldShowFieldError = (field: ProfileField) => submitAttempted || Boolean(touchedFields[field]);
  const normalizedStreamUsername = streamForm.username.trim();
  const trimmedStreamUrl = streamForm.url.trim();
  const isStreamUsernameInvalid =
    normalizedStreamUsername.length < 2 || normalizedStreamUsername.length > 100 || !STREAM_USERNAME_PATTERN.test(normalizedStreamUsername);
  const isStreamUrlInvalid = !trimmedStreamUrl || !isAvatarUrlValid(trimmedStreamUrl);
  const isDuplicateStreamAccount = streamAccounts.some(
    (account) =>
      account.platform === streamForm.platform &&
      account.platformUsername.toLowerCase() === normalizedStreamUsername.toLowerCase()
  );
  const canAddStreamAccount =
    !isAddingStreamAccount &&
    !isStreamUsernameInvalid &&
    !isStreamUrlInvalid &&
    !isDuplicateStreamAccount;

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (isDisplayNameInvalid) {
      errors.push(t("pages.profile.validation.displayName"));
    }

    if (isUsernameFormatInvalid) {
      errors.push(t("pages.profile.validation.username"));
    }

    if (isBioInvalid) {
      errors.push(t("pages.profile.validation.bio", { count: BIO_MAX_LENGTH }));
    }

    if (isAvatarUrlInvalid) {
      errors.push(t("pages.profile.validation.avatarUrl"));
    }

    if (isUsernameUnavailable) {
      errors.push(t("pages.profile.validation.usernameUnavailable"));
    }

    return errors;
  }, [isAvatarUrlInvalid, isBioInvalid, isDisplayNameInvalid, isUsernameFormatInvalid, isUsernameUnavailable, t]);

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
  const canSubmit = validationErrors.length === 0 && usernameStatus === "available" && !isSaving && !isLoading;

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
    if (!token) {
      return;
    }

    const authToken = token;

    async function loadStreamAccounts() {
      try {
        setIsStreamAccountLoading(true);
        setStreamAccounts(await listStreamAccounts(authToken));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("pages.profile.streamAccounts.loadError"));
      } finally {
        setIsStreamAccountLoading(false);
      }
    }

    void loadStreamAccounts();
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

  function updateField(field: ProfileField, value: string) {
    setSavedMessage("");
    setError("");
    setForm((current) => ({
      ...current,
      [field]: field === "bio" ? value.slice(0, BIO_MAX_LENGTH) : value
    }));
  }

  function markFieldTouched(field: ProfileField) {
    setTouchedFields((current) => ({
      ...current,
      [field]: true
    }));
  }

  function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
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

  function updateStreamField(field: keyof StreamAccountFormState, value: string) {
    setStreamAccountFeedback("");
    setError("");
    setStreamForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleAddStreamAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !canAddStreamAccount) {
      return;
    }

    try {
      setIsAddingStreamAccount(true);
      setError("");
      setStreamAccountFeedback("");
      const account = await addStreamAccount(token, {
        platform: streamForm.platform,
        username: normalizedStreamUsername,
        url: trimmedStreamUrl
      });
      setStreamAccounts((current) => [...current, account].sort((left, right) => left.platform.localeCompare(right.platform)));
      setStreamForm({
        platform: "TWITCH",
        username: "",
        url: ""
      });
      setStreamAccountFeedback(t("pages.profile.streamAccounts.addSuccess"));
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : t("pages.profile.streamAccounts.addError"));
    } finally {
      setIsAddingStreamAccount(false);
    }
  }

  async function handleRemoveStreamAccount(accountId: string) {
    if (!token || removingStreamAccountId) {
      return;
    }

    const removedAccount = streamAccounts.find((account) => account.id === accountId);

    try {
      setRemovingStreamAccountId(accountId);
      setError("");
      setStreamAccountFeedback("");
      setStreamAccounts((current) => current.filter((account) => account.id !== accountId));
      await removeStreamAccount(token, accountId);
      setStreamAccountFeedback(t("pages.profile.streamAccounts.removeSuccess"));
    } catch (removeError) {
      if (removedAccount) {
        setStreamAccounts((current) => (current.some((account) => account.id === removedAccount.id) ? current : [...current, removedAccount]));
      }
      setError(removeError instanceof Error ? removeError.message : t("pages.profile.streamAccounts.removeError"));
    } finally {
      setRemovingStreamAccountId("");
    }
  }

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setTouchedFields({
      avatarUrl: true,
      bio: true,
      displayName: true,
      username: true
    });

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
      setSubmitAttempted(false);
      setTouchedFields({});
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
          <Avatar
            alt={t("pages.profile.avatarPreviewAlt")}
            className="avatar-large avatar-preview"
            imageUrl={avatarSource}
            label={form.displayName || form.username}
            showImage={!avatarImageFailed}
            onImageError={() => setAvatarImageFailed(true)}
          />
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
                  {item.label}
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
                    aria-describedby="display-name-feedback"
                    aria-invalid={shouldShowFieldError("displayName") && isDisplayNameInvalid}
                    placeholder={t("pages.profile.displayNamePlaceholder")}
                    disabled={isSaving}
                    value={form.displayName}
                    onChange={(event) => updateField("displayName", event.target.value)}
                    onBlur={() => markFieldTouched("displayName")}
                  />
                  <small id="display-name-feedback" className={shouldShowFieldError("displayName") && isDisplayNameInvalid ? "field-hint is-error" : "field-hint"}>
                    {shouldShowFieldError("displayName") && isDisplayNameInvalid
                      ? t("pages.profile.validation.displayName")
                      : t("pages.profile.help.displayName")}
                  </small>
                </label>
                <label>
                  <span>{t("pages.profile.username")}</span>
                  <div className="username-input-wrap">
                    <span>@</span>
                    <input
                      aria-describedby="username-feedback"
                      aria-invalid={shouldShowFieldError("username") && isUsernameInvalid}
                      placeholder={t("pages.profile.usernamePlaceholder")}
                      disabled={isSaving}
                      value={form.username}
                      onChange={(event) => updateField("username", event.target.value.toLowerCase())}
                      onBlur={() => markFieldTouched("username")}
                    />
                  </div>
                  <small id="username-feedback" className={`field-hint username-status is-${usernameStatus}`}>
                    {shouldShowFieldError("username") && isUsernameFormatInvalid
                      ? t("pages.profile.validation.username")
                      : t(`pages.profile.usernameStatus.${usernameStatus}`)}
                  </small>
                </label>
                <div className="full-width avatar-editor">
                  <label>
                    <span>{t("pages.profile.avatarUrl")}</span>
                    <input
                      aria-describedby="avatar-url-feedback"
                      aria-invalid={shouldShowFieldError("avatarUrl") && isAvatarUrlInvalid}
                      placeholder={t("pages.profile.avatarUrlPlaceholder")}
                      disabled={isSaving}
                      value={form.avatarUrl}
                      onChange={(event) => updateField("avatarUrl", event.target.value)}
                      onBlur={() => markFieldTouched("avatarUrl")}
                    />
                    <small id="avatar-url-feedback" className={shouldShowFieldError("avatarUrl") && isAvatarUrlInvalid ? "field-hint is-error" : "field-hint"}>
                      {shouldShowFieldError("avatarUrl") && isAvatarUrlInvalid
                        ? t("pages.profile.validation.avatarUrl")
                        : t("pages.profile.help.avatarUrl")}
                    </small>
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
                    aria-describedby="bio-feedback"
                    aria-invalid={shouldShowFieldError("bio") && isBioInvalid}
                    disabled={isSaving}
                    maxLength={BIO_MAX_LENGTH}
                    rows={5}
                    value={form.bio}
                    onChange={(event) => updateField("bio", event.target.value)}
                    onBlur={() => markFieldTouched("bio")}
                  />
                  <small id="bio-feedback" className={bioCharactersLeft < 30 ? "field-hint is-warning" : "field-hint"}>
                    {t("pages.profile.bioCounter", { count: bioCharactersLeft })}
                  </small>
                </label>
                {submitAttempted && validationErrors.length ? (
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

              <section className="stream-account-manager">
                <div className="panel-heading">
                  <span className="eyebrow">{t("pages.profile.streamAccounts.editorEyebrow")}</span>
                  <strong>{t("pages.profile.streamAccounts.editorTitle")}</strong>
                  <p className="muted">{t("pages.profile.streamAccounts.editorDescription")}</p>
                </div>
                {isStreamAccountLoading ? <Loader label={t("pages.profile.streamAccounts.loading")} compact /> : null}
                <form className="form-grid stream-account-form" onSubmit={handleAddStreamAccount}>
                  <label>
                    <span>{t("pages.profile.streamAccounts.platform")}</span>
                    <select
                      disabled={isAddingStreamAccount}
                      value={streamForm.platform}
                      onChange={(event) => updateStreamField("platform", event.target.value as StreamAccountFormState["platform"])}
                    >
                      {STREAM_PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>
                          {t(`pages.profile.platforms.${platform}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{t("pages.profile.streamAccounts.username")}</span>
                    <input
                      aria-invalid={Boolean(streamForm.username) && isStreamUsernameInvalid}
                      disabled={isAddingStreamAccount}
                      placeholder={t("pages.profile.streamAccounts.usernamePlaceholder")}
                      value={streamForm.username}
                      onChange={(event) => updateStreamField("username", event.target.value)}
                    />
                    <small className={isStreamUsernameInvalid && streamForm.username ? "field-hint is-error" : "field-hint"}>
                      {t("pages.profile.streamAccounts.usernameHelp")}
                    </small>
                  </label>
                  <label className="full-width">
                    <span>{t("pages.profile.streamAccounts.url")}</span>
                    <input
                      aria-invalid={Boolean(streamForm.url) && isStreamUrlInvalid}
                      disabled={isAddingStreamAccount}
                      placeholder={t("pages.profile.streamAccounts.urlPlaceholder")}
                      value={streamForm.url}
                      onChange={(event) => updateStreamField("url", event.target.value)}
                    />
                    <small className={(isStreamUrlInvalid && streamForm.url) || isDuplicateStreamAccount ? "field-hint is-error" : "field-hint"}>
                      {isDuplicateStreamAccount
                        ? t("pages.profile.streamAccounts.duplicate")
                        : t("pages.profile.streamAccounts.urlHelp")}
                    </small>
                  </label>
                  <div className="form-actions full-width">
                    <button className="button" disabled={!canAddStreamAccount} type="submit">
                      {isAddingStreamAccount ? t("common.actions.saving") : t("pages.profile.streamAccounts.addAction")}
                    </button>
                  </div>
                </form>
                {streamAccountFeedback ? <StatusMessage tone="success" message={streamAccountFeedback} /> : null}
                <div className="stream-account-list stream-account-list-edit">
                  {streamAccounts.length ? (
                    streamAccounts.map((account) => (
                      <div className="stream-account-item stream-account-edit-item" key={account.id}>
                        <span className={`stream-platform-mark platform-${account.platform.toLowerCase()}`}>
                          {account.platform.charAt(0)}
                        </span>
                        <span>
                          <strong>{t(`pages.profile.platforms.${account.platform}`)}</strong>
                          <small>{account.platformUsername}</small>
                        </span>
                        <a href={account.channelUrl} rel="noreferrer" target="_blank">
                          {t("pages.profile.streamAccounts.open")}
                        </a>
                        <button
                          className="button button-secondary remove-favorite-button"
                          disabled={Boolean(removingStreamAccountId)}
                          onClick={() => void handleRemoveStreamAccount(account.id)}
                          type="button"
                        >
                          {removingStreamAccountId === account.id
                            ? t("common.actions.removing")
                            : t("common.actions.remove")}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="muted">{t("pages.profile.streamAccounts.empty")}</p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
