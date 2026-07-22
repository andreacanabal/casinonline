"use client";

import { formatChipLabel } from "@/constants/roulette";

interface Props {
  value: number;
  size?: number;
  selected?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

// Color por denominación, al estilo clásico de fichas de casino (cada valor tiene su propio color)
const CHIP_COLORS: Record<number, string> = {
  500: "#c81e3a", // rojo
  1000: "#6a1fb0", // púrpura
  3000: "#123c66", // azul marino
  5000: "#111114", // negro (ficha de alto valor, detalle dorado)
};

const SUITS = ["♣", "♦", "♥", "♠"];

/**
 * Ficha de casino clásica: aro de rayos blancos sobre color, símbolos de
 * palo en el borde y núcleo marfil con el monto en tipografía serif.
 */
export default function CasinoChip({ value, size = 48, selected = false, onClick, interactive = true }: Props) {
  const color = CHIP_COLORS[value] ?? "#2E2E35";
  const label = formatChipLabel(value);
  const isPremium = value >= 5000;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      style={{ width: size, height: size }}
      className={`relative rounded-full transition-all duration-150 ${
        interactive ? "cursor-pointer active:scale-95" : "cursor-default"
      } ${selected ? "scale-110 -translate-y-1" : ""}`}
    >
      {/* Aro exterior tipo ficha clásica: rayos blancos sobre color */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `repeating-conic-gradient(${color} 0deg 24deg, #f5f0e6 24deg 30deg)`,
          boxShadow: selected ? `0 0 16px ${color}99, 0 4px 10px rgba(0,0,0,0.6)` : "0 3px 8px rgba(0,0,0,0.55)",
        }}
      />

      {/* Símbolos de palo (club, diamante, corazón, pica) */}
      {SUITS.map((s, i) => {
        const angle = i * 90 + 45;
        return (
          <span
            key={s}
            className="absolute inset-0 flex items-start justify-center pointer-events-none"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <span
              style={{
                transform: `translateY(${size * 0.11}px) rotate(${-angle}deg)`,
                fontSize: size * 0.13,
                color: isPremium ? "#F4D06F" : "#f5f0e6",
                lineHeight: 1,
              }}
            >
              {s}
            </span>
          </span>
        );
      })}

      {/* Núcleo marfil con el monto */}
      <div
        className="absolute rounded-full flex items-center justify-center font-mono font-bold"
        style={{
          inset: size * 0.22,
          background: "radial-gradient(circle at 35% 30%, #ffffff, #efe9d8 85%)",
          border: `2px solid ${isPremium ? "#D4AF37" : color}`,
          color: "#161619",
          fontSize: size * 0.23,
        }}
      >
        {label}
      </div>

      {/* Brillo superior */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ inset: size * 0.22, background: "linear-gradient(160deg, rgba(255,255,255,0.55) 0%, transparent 45%)" }}
      />
    </button>
  );
}
