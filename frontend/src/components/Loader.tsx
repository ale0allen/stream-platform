import { useTranslation } from "react-i18next";

interface LoaderProps {
  label?: string;
  compact?: boolean;
}

export function Loader({ label, compact = false }: LoaderProps) {
  const { t } = useTranslation();

  return (
    <div className={`state-card loading-state${compact ? " compact-state" : ""}`}>
      <span className="loading-dot" aria-hidden="true" />
      <span>{label ?? t("states.loading")}</span>
    </div>
  );
}
