import { SHOW_PAW_DECOR } from "../config";
import { PawIcon } from "./icons";

type PawPrint = {
  /** Posição dentro da seção, em % (cantos livres, fora do conteúdo). */
  top: string;
  left: string;
  /** Tamanho em px. */
  size: number;
  /** Rotação em graus — simula a pegada de quem caminha. */
  rotate: number;
  opacity: number;
};

/** Patas "andando" pelos cantos das seções, sempre em pares. */
const TRAIL: PawPrint[] = [
  { top: "20%", left: "92%", size: 30, rotate: 16, opacity: 0.12 },
  { top: "29%", left: "89%", size: 30, rotate: 16, opacity: 0.12 },
  { top: "47%", left: "4%", size: 26, rotate: -18, opacity: 0.1 },
  { top: "56%", left: "7%", size: 26, rotate: -18, opacity: 0.1 },
  { top: "76%", left: "88%", size: 22, rotate: 12, opacity: 0.08 },
  { top: "84%", left: "91%", size: 22, rotate: 12, opacity: 0.08 },
];

/**
 * Trilha de patas decorativa, usada como fundo das seções.
 *
 * É só decoração: fica atrás do conteúdo (`-z-10`), não recebe cliques e é
 * ignorada por leitores de tela. A seção que a usa precisa ter
 * `relative isolate` para as patas não cobrirem o conteúdo.
 */
export function PawTrail({ className = "" }: { className?: string }) {
  if (!SHOW_PAW_DECOR) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {TRAIL.map((p) => (
        <PawIcon
          key={`${p.top}-${p.left}`}
          className="absolute text-rose"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/** Faixa de patinhas que funciona como borda decorativa do rodapé. */
export function PawStrip({ count = 26, className = "" }: { count?: number; className?: string }) {
  if (!SHOW_PAW_DECOR) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none flex items-center justify-between text-rose/20 ${className}`}
    >
      {/* No celular, 26 patinhas ficam apertadas na largura da tela: metade
          delas é escondida e a faixa continua com o mesmo desenho. */}
      {Array.from({ length: count }, (_, i) => (
        <PawIcon key={i} className={`h-3.5 w-3.5 ${i % 2 ? "hidden rotate-12 sm:block" : "-rotate-12"}`} />
      ))}
    </div>
  );
}