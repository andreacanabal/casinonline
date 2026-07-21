import { WHEEL_ORDER, getNumberColor, getDozen, getColumn } from "@/constants/roulette";
import { SpinResult } from "@/types/roulette";

/**
 * Genera un resultado 100% simulado y local.
 * No se conecta a ningún servicio externo ni representa un sorteo real.
 * Usa crypto.getRandomValues cuando está disponible para una distribución uniforme de calidad demo.
 */
export function generateFictionalResult(): SpinResult {
  let randomIndex: number;
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    randomIndex = buf[0] % WHEEL_ORDER.length;
  } else {
    randomIndex = Math.floor(Math.random() * WHEEL_ORDER.length);
  }

  const number = WHEEL_ORDER[randomIndex];
  const color = getNumberColor(number);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    number,
    color,
    isEven: number === 0 ? null : number % 2 === 0,
    dozen: getDozen(number),
    column: getColumn(number),
    isLow: number === 0 ? null : number <= 18,
    timestamp: Date.now(),
  };
}

export function pocketIndexForNumber(n: number): number {
  return WHEEL_ORDER.indexOf(n);
}
