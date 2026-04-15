interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  badge?: string;
}

export function SectionHeader({ eyebrow, title, description, badge }: SectionHeaderProps) {
  return (
    <div className="section-header card">
      <div className="section-header-main">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {badge ? <span className="section-badge">{badge}</span> : null}
    </div>
  );
}
