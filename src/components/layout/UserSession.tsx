"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Insignia de sesión puramente visual — no hay autenticación real,
 * ni credenciales, ni datos de usuario reales. Solo estética de mesa en vivo.
 */
export default function UserSession() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-graphite-border bg-graphite-light/60 hover:border-gold/40 transition-all"
      >
        <span className="relative w-7 h-7 rounded-full bg-gold-sheen bg-[length:200%_100%] flex items-center justify-center text-[11px] font-mono font-bold text-black">
          MV
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-graphite" />
        </span>
        <span className="text-xs text-white/70 hidden sm:block">Mvx</span>
        <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" className="text-white/40" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 rounded-xl border border-graphite-border bg-graphite/95 backdrop-blur-xl shadow-premium overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-graphite-border">
              <p className="text-xs text-white/80 font-medium">Mvx</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Sesión activa
              </p>
            </div>
            <button className="w-full text-left px-4 py-2.5 text-xs text-white/60 hover:bg-white/5 transition-colors">
              Perfil
            </button>
            <button className="w-full text-left px-4 py-2.5 text-xs text-white/60 hover:bg-white/5 transition-colors">
              Historial de sesión
            </button>
            <button className="w-full text-left px-4 py-2.5 text-xs text-garnet-bright hover:bg-white/5 transition-colors">
              Cerrar sesión
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
