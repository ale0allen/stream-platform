import { useTranslation } from "react-i18next";
import type { ProfileCompletionResult } from "../modules/profile/profileCompletion";

export function ProfileCompletionProgress({ completion }: { completion: ProfileCompletionResult }) {
  const { t } = useTranslation();

  return (
    <div className="profile-completeness">
      <div className="profile-completeness-heading">
        <span>{t("pages.profile.completeness.title")}</span>
        <strong>{completion.percent}%</strong>
      </div>
      <div className="profile-completeness-track" aria-hidden="true">
        <span style={{ width: `${completion.percent}%` }} />
      </div>
      <div className="profile-checklist">
        {completion.items.map((item) => (
          <span className={item.complete ? "is-complete" : ""} key={item.key}>
            {t(`pages.profile.completeness.items.${item.key}`)}
          </span>
        ))}
      </div>
    </div>
  );
}

