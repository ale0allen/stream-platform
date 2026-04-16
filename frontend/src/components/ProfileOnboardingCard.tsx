import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { Profile } from "../services/types";
import type { ProfileCompletionResult } from "../modules/profile/profileCompletion";
import { ProfileCompletionProgress } from "./ProfileCompletionProgress";

function joinHumanList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} e ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

export function ProfileOnboardingCard({
  profile,
  completion,
  isNewUser,
  showDismiss,
  onDismiss
}: {
  profile: Profile;
  completion: ProfileCompletionResult;
  isNewUser: boolean;
  showDismiss?: boolean;
  onDismiss?: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const missingLabels = useMemo(() => {
    const incompleteItems = completion.items.filter((item) => !item.complete);
    return incompleteItems.map((item) => t(`pages.profile.completeness.items.${item.key}`));
  }, [completion.items, t]);

  const missingText = useMemo(() => joinHumanList(missingLabels), [missingLabels]);

  function goToCompleteProfile() {
    navigate("/profile");
  }

  function goToStreamAccounts() {
    navigate("/profile#stream-accounts");
  }

  function goToDiscovery() {
    navigate("/discovery");
  }

  function goToPublicProfile() {
    if (!profile.username) return;
    navigate(`/u/${profile.username}`);
  }

  const isComplete = completion.percent >= 100 && completion.completedCount === completion.totalCount;

  function ActionRow({ children }: { children: ReactNode }) {
    return <div className="onboarding-actions">{children}</div>;
  }

  return (
    <article className="card onboarding-card">
      <div className="onboarding-card-top">
        <div className="onboarding-copy">
          <span className="eyebrow">{isComplete ? t("pages.home.nextSteps.eyebrow") : t("pages.home.onboarding.eyebrow")}</span>
          <h3 className="onboarding-title">
            {isComplete ? t("pages.home.nextSteps.title") : isNewUser ? t("pages.home.onboarding.titleNew") : t("pages.home.onboarding.title")}
          </h3>
          <p className="muted onboarding-description">
            {isComplete
              ? t("pages.home.nextSteps.description")
              : isNewUser
                ? t("pages.home.onboarding.descriptionNew", { missing: missingText })
                : t("pages.home.onboarding.description", { percent: completion.percent, missing: missingText })}
          </p>
        </div>
        {showDismiss && onDismiss ? (
          <button className="button button-secondary onboarding-dismiss" type="button" onClick={onDismiss}>
            {t("pages.home.onboarding.dismiss")}
          </button>
        ) : null}
      </div>

      <ProfileCompletionProgress completion={completion} />

      {isComplete ? (
        <ActionRow>
          <button className="button" type="button" onClick={goToDiscovery}>
            {t("pages.home.nextSteps.actions.exploreCreators")}
          </button>
          <button className="button button-secondary" type="button" onClick={goToPublicProfile}>
            {t("pages.home.nextSteps.actions.viewPublicProfile")}
          </button>
        </ActionRow>
      ) : (
        <ActionRow>
          <button className="button" type="button" onClick={goToCompleteProfile}>
            {t("pages.home.onboarding.actions.completeProfile")}
          </button>

          {completion.items.find((item) => item.key === "streamAccounts" && !item.complete) ? (
            <button className="button button-secondary" type="button" onClick={goToStreamAccounts}>
              {t("pages.home.onboarding.actions.addStreamAccount")}
            </button>
          ) : null}

          <button className="button button-secondary" type="button" onClick={goToDiscovery}>
            {t("pages.home.onboarding.actions.exploreCreators")}
          </button>
          <button className="button button-secondary" type="button" onClick={goToPublicProfile}>
            {t("pages.home.onboarding.actions.viewPublicProfile")}
          </button>
        </ActionRow>
      )}
    </article>
  );
}

