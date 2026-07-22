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

// Apuestas "de afuera" — nunca números específicos. Usadas por Auto Play
// para elegir una apuesta automáticamente cuando no hay ninguna puesta.
export const OUTSIDE_BET_KEYS: BetKey[] = [
  "red",
  "black",
  "even",
  "odd",
  "low",
  "high",
  "dozen-1",
  "dozen-2",
  "dozen-3",
  "column-1",
  "column-2",
  "column-3",
];

export function isOutsideBetKey(key: string): key is BetKey {
  return (OUTSIDE_BET_KEYS as string[]).includes(key);
}

export function labelForOutsideBet(key: BetKey): string {
  switch (key) {
    case "red":
      return "Rojo";
    case "black":
      return "Negro";
    case "even":
      return "Par";
    case "odd":
      return "Impar";
    case "low":
      return "1-18";
    case "high":
      return "19-36";
    case "dozen-1":
      return "1ra docena";
    case "dozen-2":
      return "2da docena";
    case "dozen-3":
      return "3ra docena";
    case "column-1":
      return "1ra columna";
    case "column-2":
      return "2da columna";
    case "column-3":
      return "3ra columna";
    default:
      return key;
  }
}

// Etiqueta de proporción de pago para mostrar en la mesa (ej. "2 a 1")
export function payoutRatioLabel(key: BetKey): string {
  return `${payoutForBet(key)} a 1`;
}

export const CHIP_VALUES = [500, 1000, 3000, 5000] as const;

export function formatChipLabel(value: number): string {
  return value >= 1000 ? `${value / 1000}K` : String(value);
}

// Paleta por denominación, inspirada en fichas de casino reales (cada valor tiene su propio color)
export const CHIP_THEME: Record<number, { base: string; base2: string; edge: string; text: string }> = {
  500: { base: "#2E2E35", base2: "#17171B", edge: "#D4AF37", text: "#F4D06F" },
  1000: { base: "#9E1B32", base2: "#5c0f1d", edge: "#D4AF37", text: "#F4E9C9" },
  3000: { base: "#123C55", base2: "#0a2131", edge: "#D4AF37", text: "#F4D06F" },
  5000: { base: "#0a0a0c", base2: "#1c1c20", edge: "#F4D06F", text: "#F4D06F" },
};

const MIN_STARTING_BALANCE = 5000;
const MAX_STARTING_BALANCE = 25000;

// Saldo inicial distinto cada vez que arranca la app (entre $5,000 y $25,000),
// redondeado a múltiplos de $500 para que se vea "limpio".
export function generateStartingBalance(): number {
  const value = Math.random() * (MAX_STARTING_BALANCE - MIN_STARTING_BALANCE) + MIN_STARTING_BALANCE;
  return Math.round(value / 500) * 500;
}

// Modo "regalo": cuando una ronda tiene apuesta activa, el resultado está
// dirigido a que gane el WIN_PROBABILITY de las veces (el resto es una
// tirada real al azar, para que se sienta con algo de suspenso). Pensado
// para un uso personal y consentido (canje de regalos), no para un
// producto público de apuestas.
export const WIN_PROBABILITY = 0.85;

// Duraciones de la ronda (ms) — puramente estéticas
export const COUNTDOWN_SECONDS = 5;
export const SPIN_DURATION_MS = 5200;
