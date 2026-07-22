"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SpinResult } from "@/types/roulette";
import GlassPanel from "@/components/layout/GlassPanel";

interface Props {
  history: SpinResult[];
}

const colorStyles: Record<string, string> = {
  red: "bg-garnet text-white border-garnet-bright/40",
  black: "bg-[#111114] text-white border-white/10",
  green: "bg-[#0E6B3C] text-white border-emerald-400/30",
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-wider text-white/50 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
      {children}
    </span>
  );
}

export default function ResultHistory({ history }: Props) {
  return (
    <GlassPanel className="p-4 w-full flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-gold text-sm tracking-widest uppercase">Historial</h2>
        <span className="text-white/40 text-xs font-mono">{history.length} rondas</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
          {history.slice(0, 18).map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.6, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
              className={`w-9 h-9 rounded-full flex items-center justify-center border font-mono text-sm font-semibold ${colorStyles[r.color]}`}
              title={`${r.number} · ${r.color}`}
            >
              {r.number}
            </motion.div>
          ))}
        </AnimatePresence>
        {history.length === 0 && (
          <p className="text-white/30 text-xs italic">Aún no hay resultados en esta sesión.</p>
        )}
      </div>

      {history[0] && (
        <div className="mt-2 pt-3 border-t border-graphite-border flex flex-wrap gap-1.5">
          <Badge>{history[0].color === "red" ? "Rojo" : history[0].color === "black" ? "Negro" : "Cero"}</Badge>
          {history[0].isEven !== null && <Badge>{history[0].isEven ? "Par" : "Impar"}</Badge>}
          {history[0].dozen && <Badge>{`Docena ${history[0].dozen}`}</Badge>}
          {history[0].isLow !== null && <Badge>{history[0].isLow ? "1-18" : "19-36"}</Badge>}
        </div>
      )}
    </GlassPanel>
  );
}
