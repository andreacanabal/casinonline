"use client";

import { BetKey, BetsMap } from "@/types/roulette";
import { RED_NUMBERS } from "@/constants/roulette";
import GlassPanel from "@/components/layout/GlassPanel";
import CasinoChip from "@/components/betting/CasinoChip";

interface Props {
  bets: BetsMap;
  winningKeys: BetKey[];
  disabled: boolean;
  onPlaceBet: (key: BetKey) => void;
}

const TOP_ROW = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]; // columna 3
const MID_ROW = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]; // columna 2
const BOTTOM_ROW = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]; // columna 1

function ChipStack({ amount }: { amount: number }) {
  if (!amount) return null;
  return (
    <div className="absolute -top-2.5 -right-1.5 z-10 pointer-events-none">
      <CasinoChip value={amount} size={24} interactive={false} />
    </div>
  );
}

export default function BettingTable({ bets, winningKeys, disabled, onPlaceBet }: Props) {
  const isWinning = (key: BetKey) => winningKeys.includes(key);

  const cellBase =
    "relative flex items-center justify-center select-none cursor-pointer border border-graphite-border/70 font-mono text-sm font-semibold transition-all duration-150 hover:brightness-125 active:scale-95";

  const numberCell = (n: number) => {
    const key = `number-${n}` as BetKey;
    const color = n === 0 ? "green" : RED_NUMBERS.has(n) ? "red" : "black";
    const bg = color === "red" ? "bg-garnet/80" : color === "green" ? "bg-[#0E6B3C]/80" : "bg-[#111114]";
    return (
      <button
        key={key}
        disabled={disabled}
        onClick={() => onPlaceBet(key)}
        className={`${cellBase} ${bg} text-white rounded-sm h-10 disabled:cursor-not-allowed ${
          isWinning(key) ? "ring-2 ring-gold shadow-gold-glow z-10" : ""
        }`}
      >
        {n}
        <ChipStack amount={bets[key] ?? 0} />
      </button>
    );
  };

  const outsideCell = (key: BetKey, label: string, extraClass = "", span = 1, sublabel?: string) => (
    <button
      key={key}
      disabled={disabled}
      onClick={() => onPlaceBet(key)}
      style={{ gridColumn: `span ${span} / span ${span}` }}
      className={`${cellBase} ${extraClass} rounded-md h-11 text-xs uppercase tracking-wider disabled:cursor-not-allowed ${
        isWinning(key) ? "ring-2 ring-gold shadow-gold-glow z-10" : ""
      }`}
    >
      <span className="flex flex-col items-center leading-tight gap-0.5">
        <span>{label}</span>
        {sublabel && <span className="text-[9px] opacity-60 normal-case tracking-normal">{sublabel}</span>}
      </span>
      <ChipStack amount={bets[key] ?? 0} />
    </button>
  );

  return (
    <GlassPanel className="p-4 w-full">
      <div className="grid gap-1" style={{ gridTemplateColumns: "56px repeat(12, 1fr) 68px" }}>
        {/* Cero */}
        <button
          disabled={disabled}
          onClick={() => onPlaceBet("number-0" as BetKey)}
          style={{ gridRow: "span 3 / span 3" }}
          className={`${cellBase} bg-[#0E6B3C]/80 text-white rounded-sm disabled:cursor-not-allowed ${
            isWinning("number-0" as BetKey) ? "ring-2 ring-gold shadow-gold-glow z-10" : ""
          }`}
        >
          0
          <ChipStack amount={bets["number-0" as BetKey] ?? 0} />
        </button>

        {TOP_ROW.map((n) => numberCell(n))}
        {outsideCell("column-3", "2 a 1", "bg-graphite-light text-gold/80")}

        {MID_ROW.map((n) => numberCell(n))}
        {outsideCell("column-2", "2 a 1", "bg-graphite-light text-gold/80")}

        {BOTTOM_ROW.map((n) => numberCell(n))}
        {outsideCell("column-1", "2 a 1", "bg-graphite-light text-gold/80")}
      </div>

      {/* Docenas — pagan 2 a 1, igual que las columnas */}
      <div className="grid gap-1 mt-1" style={{ gridTemplateColumns: "56px repeat(12, 1fr) 68px" }}>
        <div />
        {outsideCell("dozen-1", "1ra docena", "bg-graphite-light text-white/80", 4, "2 a 1")}
        {outsideCell("dozen-2", "2da docena", "bg-graphite-light text-white/80", 4, "2 a 1")}
        {outsideCell("dozen-3", "3ra docena", "bg-graphite-light text-white/80", 4, "2 a 1")}
        <div />
      </div>

      {/* Apuestas de igualdad de dinero */}
      <div className="grid gap-1 mt-1" style={{ gridTemplateColumns: "56px repeat(12, 1fr) 68px" }}>
        <div />
        {outsideCell("low", "1 – 18", "bg-graphite-light text-white/80", 2)}
        {outsideCell("even", "Par", "bg-graphite-light text-white/80", 2)}
        {outsideCell("red", "Rojo", "bg-garnet/70 text-white", 2)}
        {outsideCell("black", "Negro", "bg-[#111114] text-white", 2)}
        {outsideCell("odd", "Impar", "bg-graphite-light text-white/80", 2)}
        {outsideCell("high", "19 – 36", "bg-graphite-light text-white/80", 2)}
        <div />
      </div>
    </GlassPanel>
  );
}
