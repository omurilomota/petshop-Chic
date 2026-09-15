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
