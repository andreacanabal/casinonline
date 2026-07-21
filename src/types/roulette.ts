// Tipos del dominio — simulación ficticia de ruleta europea.
// Ningún tipo aquí representa datos reales de apuestas ni de un casino real.

export type PocketColor = "red" | "black" | "green";

export interface SpinResult {
  id: string;
  number: number; // 0-36
  color: PocketColor;
  isEven: boolean | null; // null para el 0
  dozen: 1 | 2 | 3 | null;
  column: 1 | 2 | 3 | null;
  isLow: boolean | null; // 1-18 true, 19-36 false, 0 null
  timestamp: number;
}

// Claves de apuesta soportadas por la mesa
export type BetKey =
  | `number-${number}` // number-0 .. number-36
  | "red"
  | "black"
  | "even"
  | "odd"
  | "low" // 1-18
  | "high" // 19-36
  | "dozen-1"
  | "dozen-2"
  | "dozen-3"
  | "column-1"
  | "column-2"
  | "column-3";

export interface BetDefinition {
  key: BetKey;
  label: string;
  payout: number; // multiplicador sobre lo apostado (ganancia neta = amount * payout)
}

export type BetsMap = Partial<Record<BetKey, number>>;

export interface RoundNotification {
  id: string;
  kind: "info" | "win" | "loss" | "bet" | "streak";
  title: string;
  subtitle?: string;
}

export type SpinPhase = "idle" | "betting" | "countdown" | "spinning" | "result";
