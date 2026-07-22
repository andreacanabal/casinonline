"use client";

import { AnimatePresence, motion } from "framer-motion";
import GlassPanel from "@/components/layout/GlassPanel";
import { formatCurrency } from "@/utils/format";
import type { CommunityWinEntry } from "@/store/useRouletteStore";

interface Props {
  entries: CommunityWinEntry[];
}

export default function CommunityFeed({ entries }: Props) {
  return (
    <GlassPanel className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-gold text-sm tracking-widest uppercase">Actividad de la mesa</h2>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
      </div>

      <div className="flex flex-col gap-2 max-h-52 overflow-hidden">
        <AnimatePresence initial={false}>
          {entries.slice(0, 6).map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-between text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2"
            >
              <span className="text-white/55 font-mono">{e.name}</span>
              <span className="text-emerald-400 font-mono font-semibold">+{formatCurrency(e.amount)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {entries.length === 0 && <p className="text-white/30 text-xs italic">Esperando actividad…</p>}
      </div>

      <p className="text-[9px] text-white/25">Datos de ejemplo generados localmente</p>
    </GlassPanel>
  );
}
