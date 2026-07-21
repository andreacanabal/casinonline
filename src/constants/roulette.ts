import { BetDefinition, BetKey, PocketColor } from "@/types/roulette";

// Orden físico estándar de una rueda de ruleta EUROPEA (37 casillas, un solo cero).
// Esto es información pública de geometría de juego, no proviene de ningún proveedor real.
export const WHEEL_ORDER: number[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export function getNumberColor(n: number): PocketColor {
  if (n === 0) return "green";
  return RED_NUMBERS.has(n) ? "red" : "black";
}

export function getDozen(n: number): 1 | 2 | 3 | null {
  if (n === 0) return null;
  if (n <= 12) return 1;
  if (n <= 24) return 2;
  return 3;
}

export function getColumn(n: number): 1 | 2 | 3 | null {
  if (n === 0) return null;
  const mod = n % 3;
  if (mod === 1) return 1;
  if (mod === 2) return 2;
  return 3;
}

// Tabla de pagos estándar (multiplicador neto, ej. pleno paga 35 a 1)
export const BET_DEFINITIONS: Record<string, Omit<BetDefinition, "key">> = {
  straight: { label: "Pleno", payout: 35 },
  red: { label: "Rojo", payout: 1 },
  black: { label: "Negro", payout: 1 },
  even: { label: "Par", payout: 1 },
  odd: { label: "Impar", payout: 1 },
  low: { label: "1-18", payout: 1 },
  high: { label: "19-36", payout: 1 },
  dozen: { label: "Docena", payout: 2 },
  column: { label: "Columna", payout: 2 },
};

export function payoutForBet(key: BetKey): number {
  if (key.startsWith("number-")) return BET_DEFINITIONS.straight.payout;
  if (key.startsWith("dozen-")) return BET_DEFINITIONS.dozen.payout;
  if (key.startsWith("column-")) return BET_DEFINITIONS.column.payout;
  return BET_DEFINITIONS[key]?.payout ?? 0;
}

export const CHIP_VALUES = [5, 25, 100, 500] as const;

export const STARTING_BALANCE = 5000;

// Duraciones de la simulación (ms) — puramente estéticas, sin relación con juego real
export const COUNTDOWN_SECONDS = 5;
export const SPIN_DURATION_MS = 5200;
