"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RoundNotification } from "@/types/roulette";

interface Props {
  notifications: RoundNotification[];
}

const kindStyles: Record<RoundNotification["kind"], string> = {
  win: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
  loss: "border-garnet-bright/40 bg-garnet/10 text-garnet-bright",
  bet: "border-gold/40 bg-gold/10 text-gold",
  streak: "border-gold-bright/50 bg-gold/15 text-gold-bright",
  info: "border-white/15 bg-white/5 text-white/70",
};

export default function NotificationStack({ notifications }: Props) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 w-72 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`rounded-xl border backdrop-blur-xl px-4 py-3 shadow-premium ${kindStyles[n.kind]}`}
          >
            <p className="font-display text-sm font-semibold tracking-wide">{n.title}</p>
            {n.subtitle && <p className="text-[11px] opacity-70 mt-0.5">{n.subtitle}</p>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
