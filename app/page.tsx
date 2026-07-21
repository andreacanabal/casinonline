"use client";

import { useCallback, useState } from "react";
import { useRouletteStore } from "@/store/useRouletteStore";
import { useRouletteEngine } from "@/hooks/useRouletteEngine";
import { useSound } from "@/hooks/useSound";
import RouletteWheel from "@/components/wheel/RouletteWheel";
import ResultHistory from "@/components/history/ResultHistory";
import BettingPanel from "@/components/betting/BettingPanel";
import BettingTable from "@/components/betting/BettingTable";
import HUD from "@/components/hud/HUD";
import StatsPanel from "@/components/stats/StatsPanel";
import NotificationStack from "@/components/notifications/NotificationStack";
import { SpinResult } from "@/types/roulette";
import { BetKey } from "@/types/roulette";

export default function Home() {
  const {
    phase,
    countdown,
    bets,
    selectedChip,
    balance,
    totalProfit,
    lastRoundProfit,
    currentStreak,
    roundsPlayed,
    totalStaked,
    sessionStart,
    history,
    lastWinningKeys,
    autoPlay,
    notifications,
    setSelectedChip,
    placeBet,
    clearBets,
    startRound,
    toggleAutoPlay,
    resetSimulation,
  } = useRouletteStore();

  const [wheelTarget, setWheelTarget] = useState<SpinResult | null>(null);
  const { play } = useSound();

  const handleResultReady = useCallback((result: SpinResult) => {
    setWheelTarget(result);
  }, []);

  useRouletteEngine(handleResultReady);

  const currentBetTotal = Object.values(bets).reduce((a: number, b) => a + (b ?? 0), 0);

  const handlePlaceBet = (key: BetKey) => {
    placeBet(key);
    play("chip");
  };

  return (
    <main className="min-h-screen w-full flex flex-col">
      {/* Barra superior: marca + disclaimer de simulación */}
      <header className="w-full px-6 py-3 flex items-center justify-between border-b border-graphite-border/70 bg-void/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold-sheen bg-[length:200%_100%] animate-shimmer shadow-gold-glow" />
          <div>
            <h1 className="font-display text-lg tracking-wide text-gold leading-none">Noir Royale</h1>
            <p className="text-[10px] text-white/40 tracking-widest uppercase">Ruleta europea — demo</p>
          </div>
        </div>
        <p className="text-[11px] text-white/40 max-w-md text-right hidden md:block">
          Simulación 100% ficticia y local con fines demostrativos. No hay dinero real, ni conexión a casinos ni apuestas
          reales.
        </p>
      </header>

      <NotificationStack notifications={notifications} />

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[300px_1fr_320px] gap-4 p-4 max-w-[2200px] mx-auto w-full">
        {/* Columna izquierda */}
        <aside className="flex flex-col gap-4 order-2 xl:order-1">
          <ResultHistory history={history} />
          <StatsPanel history={history} />
        </aside>

        {/* Centro: rueda + mesa */}
        <section className="flex flex-col items-center gap-6 order-1 xl:order-2">
          <div className="relative flex items-center justify-center py-4">
            <RouletteWheel phase={phase} targetResult={wheelTarget} size={520} />
          </div>
          <BettingTable bets={bets} winningKeys={lastWinningKeys} disabled={phase !== "betting"} onPlaceBet={handlePlaceBet} />
        </section>

        {/* Columna derecha */}
        <aside className="flex flex-col gap-4 order-3">
          <BettingPanel
            phase={phase}
            countdown={countdown}
            selectedChip={selectedChip}
            onSelectChip={setSelectedChip}
            onSpin={startRound}
            onClearBets={clearBets}
            onReset={resetSimulation}
            autoPlay={autoPlay}
            onToggleAutoPlay={toggleAutoPlay}
            currentBetTotal={currentBetTotal}
            lastResult={wheelTarget}
          />
          <HUD
            balance={balance}
            totalProfit={totalProfit}
            currentBet={currentBetTotal}
            lastRoundProfit={lastRoundProfit}
            streak={currentStreak}
            roundsPlayed={roundsPlayed}
            totalStaked={totalStaked}
            sessionStart={sessionStart}
          />
        </aside>
      </div>

      <footer className="text-center py-4 text-[10px] text-white/25 tracking-wide">
        Proyecto demostrativo · lógica y resultados generados localmente · sin valor monetario real
      </footer>
    </main>
  );
}
