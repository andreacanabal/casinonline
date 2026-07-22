"use client";

import { useEffect, useRef } from "react";
import { useRouletteStore } from "@/store/useRouletteStore";
import { useSound } from "./useSound";
import { SPIN_DURATION_MS } from "@/constants/roulette";
import { SpinResult } from "@/types/roulette";
import { resolveBets } from "@/utils/payouts";

/**
 * Motor de orquestación de rondas. Puramente local: cuenta regresiva,
 * disparo del giro y resolución del resultado ficticio.
 */
export function useRouletteEngine(onResultReady: (result: SpinResult) => void) {
  const phase = useRouletteStore((s) => s.phase);
  const countdown = useRouletteStore((s) => s.countdown);
  const autoPlay = useRouletteStore((s) => s.autoPlay);
  const tickCountdown = useRouletteStore((s) => s.tickCountdown);
  const beginSpin = useRouletteStore((s) => s.beginSpin);
  const finishSpin = useRouletteStore((s) => s.finishSpin);
  const startRound = useRouletteStore((s) => s.startRound);
  const applyAutoPlayBets = useRouletteStore((s) => s.applyAutoPlayBets);
  const bets = useRouletteStore((s) => s.bets);
  const { play } = useSound();

  const spinTargetRef = useRef<SpinResult | null>(null);

  // Cuenta regresiva
  useEffect(() => {
    if (phase !== "countdown") return;
    play("countdown");
    const t = setTimeout(() => tickCountdown(), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, tickCountdown, play]);

  // Al entrar en "spinning": determinar resultado ficticio y notificar al componente visual
  useEffect(() => {
    if (phase !== "spinning") return;
    const result = beginSpin();
    spinTargetRef.current = result;
    onResultReady(result);

    const t = setTimeout(() => {
      if (spinTargetRef.current) {
        const breakdown = resolveBets(bets, spinTargetRef.current);
        finishSpin(spinTargetRef.current);
        if (breakdown.netProfit > 0) play("win");
      }
    }, SPIN_DURATION_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto Play: repite la misma apuesta guardada cada ronda hasta que se apague o falte saldo
  useEffect(() => {
    if (!autoPlay || phase !== "betting") return;
    const t = setTimeout(() => {
      const hasBets = Object.keys(bets).length > 0;
      const ready = hasBets || applyAutoPlayBets();
      if (ready) startRound();
    }, 1200);
    return () => clearTimeout(t);
  }, [autoPlay, phase, bets, startRound, applyAutoPlayBets]);
}
