"use client";

import { useEffect, useState } from "react";
import GlassPanel from "@/components/layout/GlassPanel";
import { formatCurrency, formatDuration, formatPercent, formatSigned } from "@/utils/format";

interface Props {
  balance: number;
  totalProfit: number;
  currentBet: number;
  lastRoundProfit: number;
  streak: number;
  roundsPlayed: number;
  totalStaked: number;
  sessionStart: number;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "gold" | "win" | "loss" | "default" }) {
  const toneClass =
    tone === "gold"
      ? "text-gold"
      : tone === "win"
      ? "text-emerald-400"
      : tone === "loss"
      ? "text-garnet-bright"
      : "text-white";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest text-white/40">{label}</span>
      <span className={`font-mono text-lg font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}

export default function HUD({
  balance,
  totalProfit,
  currentBet,
  lastRoundProfit,
  streak,
  roundsPlayed,
  totalStaked,
  sessionStart,
}: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setElapsed(Date.now() - sessionStart), 1000);
    return () => clearInterval(i);
  }, [sessionStart]);

  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

  return (
    <GlassPanel className="p-4 grid grid-cols-2 gap-x-6 gap-y-4">
      <Stat label="Saldo" value={formatCurrency(balance)} tone="gold" />
      <Stat label="Ganancia total" value={formatSigned(totalProfit)} tone={totalProfit >= 0 ? "win" : "loss"} />
      <Stat label="Apuesta actual" value={formatCurrency(currentBet)} />
      <Stat
        label="Última ganancia"
        value={formatSigned(lastRoundProfit)}
        tone={lastRoundProfit > 0 ? "win" : lastRoundProfit < 0 ? "loss" : "default"}
      />
      <Stat
        label="Racha actual"
        value={streak === 0 ? "—" : `${Math.abs(streak)} ${streak > 0 ? "ganando" : "perdiendo"}`}
        tone={streak > 0 ? "win" : streak < 0 ? "loss" : "default"}
      />
      <Stat label="Rondas jugadas" value={String(roundsPlayed)} />
      <Stat label="ROI simulado" value={formatPercent(roi)} tone={roi >= 0 ? "win" : "loss"} />
      <Stat label="Tiempo jugando" value={formatDuration(elapsed)} />
    </GlassPanel>
  );
}
