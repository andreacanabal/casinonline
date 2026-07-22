"use client";

import { motion } from "framer-motion";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 shrink-0">
        <div
          className="absolute inset-0 rounded-full blur-md opacity-60 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(244,208,111,0.55), transparent 70%)" }}
        />
        <motion.svg
          viewBox="0 0 64 64"
          className="relative w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          <defs>
            <linearGradient id="qOrbit" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8A722A" />
              <stop offset="50%" stopColor="#F4D06F" />
              <stop offset="100%" stopColor="#8A722A" />
            </linearGradient>
            <radialGradient id="qCore" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#fff8e5" />
              <stop offset="55%" stopColor="#F4D06F" />
              <stop offset="100%" stopColor="#8A722A" />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="32" rx="27" ry="11" stroke="url(#qOrbit)" strokeWidth="1.6" fill="none" />
          <ellipse cx="32" cy="32" rx="27" ry="11" stroke="url(#qOrbit)" strokeWidth="1.6" fill="none" transform="rotate(60 32 32)" />
          <ellipse cx="32" cy="32" rx="27" ry="11" stroke="url(#qOrbit)" strokeWidth="1.6" fill="none" transform="rotate(120 32 32)" />
          <circle cx="32" cy="32" r="6.5" fill="url(#qCore)" />
          <circle cx="59" cy="32" r="2.3" fill="#F4D06F" />
          <circle cx="13.5" cy="14.5" r="2" fill="#F4D06F" />
          <circle cx="13.5" cy="49.5" r="2" fill="#F4D06F" />
        </motion.svg>
      </div>

      <div className="leading-none">
        <h1 className="font-display text-lg leading-none tracking-wide">
          <span className="text-gold font-bold">QUANTUM</span>{" "}
          <span className="text-white/85 font-medium">ROULETTE</span>
        </h1>
        <p className="text-[9px] text-white/35 tracking-[0.3em] uppercase mt-1">Ruleta europea</p>
      </div>
    </div>
  );
}
