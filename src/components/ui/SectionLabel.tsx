type Props = { number: string; title: string; className?: string };

/** Техническая метка секции: «03 / НАПРАВЛЕНИЯ РАБОТ». */
export function SectionLabel({ number, title, className = "" }: Props) {
  return (
    <div className={`label ${className}`}>
      <span className="ac">{number}</span> / {title}
    </div>
  );
}
