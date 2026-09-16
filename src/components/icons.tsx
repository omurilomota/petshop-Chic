import type { CSSProperties } from "react";

type IconProps = { className?: string; style?: CSSProperties };

export function PawIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <ellipse cx="5.5" cy="12" rx="2" ry="2.6" />
      <ellipse cx="9.5" cy="8" rx="2" ry="2.6" />
      <ellipse cx="14.5" cy="8" rx="2" ry="2.6" />
      <ellipse cx="18.5" cy="12" rx="2" ry="2.6" />
      <path d="M12 12.5c2.6 0 4.8 1.7 5.6 4 .6 1.7-.7 3.3-2.5 3.3-1 0-1.9-.4-3.1-.4s-2.1.4-3.1.4c-1.8 0-3.1-1.6-2.5-3.3.8-2.3 3-4 5.6-4z" />
    </svg>
  );
}

export function WhatsAppIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.6 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.9 1 1-4.8-.2-.4A9.7 9.7 0 016.2 15c0-5.4 4.4-9.8 9.8-9.8s9.8 4.4 9.8 9.8-4.4 9.8-9.8 9.8zm5.4-7.3c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1c-1.6-.8-2.7-1.5-3.7-3.3-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.8-.7 2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3z" />
    </svg>
  );
}

/**
 * Caminhos compartilhados dos ícones de linha (24x24) — endereço, horário,
 * telefone e rota. Usados nos cards de contato e na barra de ações do mobile.
 */
export const ICON_PATHS = {
  pin: "M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10zM12 11a2 2 0 100-4 2 2 0 000 4z",
  clock: "M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z",
  phone:
    "M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.4 2.1L8.1 9.9a16 16 0 006 6l1.5-1.2a2 2 0 012.1-.4c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z",
  route: "M14 4h6v6M20 4l-8.5 8.5M19 14.5V19a1 1 0 01-1 1H6a1 1 0 01-1-1V7a1 1 0 011-1h4.5",
} as const;

/** Generic stroke icon; `d` is an SVG path (24x24 viewBox). */
export function LineIcon({ d, className = "h-6 w-6", style }: IconProps & { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
