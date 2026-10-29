type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
};

export function SectionTitle({ eyebrow, title, description, align = "center" }: Props) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <span className="text-sm font-semibold uppercase tracking-widest text-rose">{eyebrow}</span>
      <h2 className="mt-3 font-serif text-3xl font-bold text-coffee sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-coffee-light">{description}</p>}
    </div>
  );
}
