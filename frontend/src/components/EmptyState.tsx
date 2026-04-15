import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="state-card empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        {t("states.emptyIcon")}
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  );
}
