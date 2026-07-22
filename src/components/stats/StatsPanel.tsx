"use client";

import { useMemo } from "react";
import GlassPanel from "@/components/layout/GlassPanel";
import { SpinResult } from "@/types/roulette";
import { formatPercent } from "@/utils/format";

interface Props {
  history: SpinResult[];
}

function Bar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-white/50 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-mono text-white/60 w-10 text-right">{formatPercent(pct)}</span>
    </div>
  );
}

export default function StatsPanel({ history }: Props) {
  const stats = useMemo(() => {
    const total = history.length || 1;
    const red = history.filter((r) => r.color === "red").length;
    const black = history.filter((r) => r.color === "black").length;
    const green = history.filter((r) => r.color === "green").length;
    const even = history.filter((r) => r.isEven === true).length;
    const odd = history.filter((r) => r.isEven === false).length;
    const d1 = history.filter((r) => r.dozen === 1).length;
    const d2 = history.filter((r) => r.dozen === 2).length;
    const d3 = history.filter((r) => r.dozen === 3).length;

    const freq: Record<number, number> = {};
    history.forEach((r) => (freq[r.number] = (freq[r.number] ?? 0) + 1));
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const hot = sorted.slice(0, 5).map(([n]) => Number(n));
    const cold = sorted.slice(-5).map(([n]) => Number(n));

    return {
      total: history.length,
      red: (red / total) * 100,
      black: (black / total) * 100,
      green: (green / total) * 100,
      even: (even / total) * 100,
      odd: (odd / total) * 100,
      d1: (d1 / total) * 100,
      d2: (d2 / total) * 100,
      d3: (d3 / total) * 100,
      hot,
      cold: history.length ? cold : [],
      freq,
    };
  }, [history]);

  return (
    <GlassPanel className="p-4 flex flex-col gap-4">
      <h2 className="font-display text-gold text-sm tracking-widest uppercase">Estadísticas</h2>

      {history.length === 0 ? (
        <p className="text-white/30 text-xs italic">Juega algunas rondas para ver estadísticas.</p>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <Bar label="Rojo" pct={stats.red} color="#C41E3A" />
            <Bar label="Negro" pct={stats.black} color="#8f8f96" />
            <Bar label="Cero" pct={stats.green} color="#0E6B3C" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Bar label="Par" pct={stats.even} color="#D4AF37" />
            <Bar label="Impar" pct={stats.odd} color="#8A722A" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Bar label="1ra doc." pct={stats.d1} color="#D4AF37" />
            <Bar label="2da doc." pct={stats.d2} color="#c9a132" />
            <Bar label="3ra doc." pct={stats.d3} color="#8A722A" />
          </div>

          <div className="pt-2 border-t border-graphite-border">
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Mapa de calor (frecuencia)</p>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 37 }, (_, n) => n).map((n) => {
                const count = stats.freq[n] ?? 0;
                const max = Math.max(1, ...Object.values(stats.freq));
                const intensity = count / max;
                return (
                  <div
                    key={n}
                    title={`${n}: ${count} veces`}
                    className="aspect-square rounded-[3px] flex items-center justify-center text-[8px] font-mono text-white/70"
                    style={{
                      background: `rgba(212,175,55,${0.08 + intensity * 0.75})`,
                      border: "1px solid rgba(212,175,55,0.15)",
                    }}
                  >
                    {n}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Calientes</p>
              <div className="flex gap-1 flex-wrap">
                {stats.hot.map((n) => (
                  <span key={n} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-garnet/30 text-garnet-bright border border-garnet/40">
                    {n}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Fríos</p>
              <div className="flex gap-1 flex-wrap">
                {stats.cold.map((n) => (
                  <span key={n} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </GlassPanel>
  );
}
