import { WHEEL_ORDER, getNumberColor, getDozen, getColumn } from "@/constants/roulette";
import { BetsMap, SpinResult } from "@/types/roulette";
import { resolveBets } from "@/utils/payouts";

/**
 * Construye el resultado completo (color, docena, columna, etc.) para un
 * número de la ruleta ya elegido, sea al azar o de forma dirigida.
 */
export function buildResult(number: number): SpinResult {
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

/**
 * Genera un resultado local al azar (0-36), sin sesgo hacia ninguna apuesta.
 * Usa crypto.getRandomValues cuando está disponible para una distribución uniforme.
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
  return buildResult(WHEEL_ORDER[randomIndex]);
}

/**
 * Busca, entre los 37 números posibles, cuál deja la mayor ganancia neta
 * para las apuestas actuales — usado únicamente cuando ALWAYS_WIN está
 * activo (modo "regalo"), para asegurar que la ronda sea siempre ganadora.
 * Devuelve null si no hay ninguna apuesta activa.
 */
export function pickGuaranteedWinningNumber(bets: BetsMap): number | null {
  if (!bets || Object.keys(bets).length === 0) return null;

  let bestNumber = 0;
  let bestProfit = -Infinity;
  for (let n = 0; n <= 36; n++) {
    const hypothetical = buildResult(n);
    const breakdown = resolveBets(bets, hypothetical);
    if (breakdown.netProfit > bestProfit) {
      bestProfit = breakdown.netProfit;
      bestNumber = n;
    }
  }
  return bestNumber;
}

export function pocketIndexForNumber(n: number): number {
  return WHEEL_ORDER.indexOf(n);
}
