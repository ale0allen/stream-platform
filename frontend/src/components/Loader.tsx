interface LoaderProps {
  label?: string;
  compact?: boolean;
}

export function Loader({ label = "Loading...", compact = false }: LoaderProps) {
  return (
    <div className={`state-card loading-state${compact ? " compact-state" : ""}`}>
      <span className="loading-dot" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
