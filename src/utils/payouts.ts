import { BetKey, BetsMap, SpinResult } from "@/types/roulette";
import { payoutForBet } from "@/constants/roulette";

export interface PayoutBreakdown {
  totalStaked: number;
  totalReturn: number; // stake devuelto + ganancia neta, de las apuestas ganadoras
  netProfit: number; // totalReturn - totalStaked
  winningKeys: BetKey[];
}

function betWins(key: BetKey, result: SpinResult): boolean {
  if (key.startsWith("number-")) {
    const n = Number(key.split("-")[1]);
    return n === result.number;
  }
  switch (key) {
    case "red":
      return result.color === "red";
    case "black":
      return result.color === "black";
    case "even":
      return result.isEven === true;
    case "odd":
      return result.isEven === false;
    case "low":
      return result.isLow === true;
    case "high":
      return result.isLow === false;
    case "dozen-1":
      return result.dozen === 1;
    case "dozen-2":
      return result.dozen === 2;
    case "dozen-3":
      return result.dozen === 3;
    case "column-1":
      return result.column === 1;
    case "column-2":
      return result.column === 2;
    case "column-3":
      return result.column === 3;
    default:
      return false;
  }
}

export function resolveBets(bets: BetsMap, result: SpinResult): PayoutBreakdown {
  let totalStaked = 0;
  let totalReturn = 0;
  const winningKeys: BetKey[] = [];

  for (const [rawKey, amount] of Object.entries(bets)) {
    const key = rawKey as BetKey;
    if (!amount) continue;
    totalStaked += amount;
    if (betWins(key, result)) {
      const payout = payoutForBet(key);
      totalReturn += amount + amount * payout; // stake + ganancia
      winningKeys.push(key);
    }
  }

  return {
    totalStaked,
    totalReturn,
    netProfit: totalReturn - totalStaked,
    winningKeys,
  };
}
