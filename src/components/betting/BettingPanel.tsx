"use client";

import { motion } from "framer-motion";
import GlassPanel from "@/components/layout/GlassPanel";
import { CHIP_VALUES } from "@/constants/roulette";
import { SpinPhase, SpinResult } from "@/types/roulette";
import { formatCurrency } from "@/utils/format";

interface Props {
  phase: SpinPhase;
  countdown: number;
  selectedChip: number;
  onSelectChip: (v: number) => void;
  onSpin: () => void;
  onClearBets: () => void;
  onReset: () => void;
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
  currentBetTotal: number;
  lastResult: SpinResult | null;
}

const phaseLabel: Record<SpinPhase, string> = {
  idle: "Listo",
  betting: "Coloca tus apuestas",
  countdown: "Cierre de apuestas",
  spinning: "Girando…",
  result: "Resultado",
};

export default function BettingPanel({
  phase,
  countdown,
  selectedChip,
  onSelectChip,
  onSpin,
  onClearBets,
  onReset,
  autoPlay,
  onToggleAutoPlay,
  currentBetTotal,
  lastResult,
}: Props) {
  const canSpin = phase === "betting" && currentBetTotal > 0;

  return (
    <GlassPanel className="p-5 flex flex-col gap-5">
      <div>
        <h2 className="font-display text-gold text-sm tracking-widest uppercase mb-1">Mesa</h2>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              phase === "spinning" ? "bg-gold animate-pulse-glow" : phase === "result" ? "bg-emerald-400" : "bg-white/30"
            }`}
          />
          <p className="text-white/80 text-sm font-medium">
            {phaseLabel[phase]}
            {phase === "countdown" && <span className="text-gold font-mono ml-1">{countdown}s</span>}
          </p>
        </div>
        {lastResult && phase === "result" && (
          <motion.p
            key={lastResult.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-white/50 mt-1"
          >
            Salió el <span className="text-gold font-semibold">{lastResult.number}</span>{" "}
            ({lastResult.color === "red" ? "rojo" : lastResult.color === "black" ? "negro" : "verde"})
          </motion.p>
        )}
      </div>

      {/* Selector de fichas */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Valor de ficha</p>
        <div className="flex gap-2">
          {CHIP_VALUES.map((v) => (
            <button
              key={v}
              onClick={() => onSelectChip(v)}
              className={`relative w-12 h-12 rounded-full font-mono text-xs font-bold border-2 transition-all
                ${
                  selectedChip === v
                    ? "border-gold bg-gold-sheen bg-[length:200%_100%] text-black shadow-gold-glow scale-105"
                    : "border-graphite-border bg-graphite-light text-gold/80 hover:border-gold/50"
                }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-widest text-white/40">Apostado esta ronda</p>
        <p className="font-mono text-2xl text-gold font-semibold">{formatCurrency(currentBetTotal)}</p>
      </div>

      <div className="flex flex-col gap-2.5 mt-auto">
        <button
          onClick={onSpin}
          disabled={!canSpin}
          className="w-full py-3 rounded-xl font-display tracking-widest uppercase text-sm font-bold
            bg-gold-sheen bg-[length:200%_100%] text-black disabled:opacity-30 disabled:cursor-not-allowed
            enabled:hover:shadow-gold-glow enabled:hover:animate-shimmer transition-all"
        >
          Girar
        </button>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onClearBets}
            disabled={phase !== "betting"}
            className="py-2.5 rounded-xl border border-graphite-border bg-graphite-light text-white/70 text-xs uppercase tracking-wider hover:border-garnet-bright/60 hover:text-white transition-all disabled:opacity-30"
          >
            Reiniciar mesa
          </button>
          <button
            onClick={onToggleAutoPlay}
            className={`py-2.5 rounded-xl border text-xs uppercase tracking-wider transition-all ${
              autoPlay
                ? "border-gold bg-gold/10 text-gold shadow-gold-glow"
                : "border-graphite-border bg-graphite-light text-white/70 hover:border-gold/50"
            }`}
          >
            Auto Play {autoPlay ? "ON" : "OFF"}
          </button>
        </div>
        <button
          onClick={onReset}
          className="w-full py-2 rounded-xl text-[11px] uppercase tracking-wider text-white/40 hover:text-garnet-bright transition-all"
        >
          Reiniciar simulación completa
        </button>
      </div>
    </GlassPanel>
  );
}
