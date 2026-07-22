import { create } from "zustand";
import { BetKey, BetsMap, RoundNotification, SpinPhase, SpinResult } from "@/types/roulette";
import { STARTING_BALANCE } from "@/constants/roulette";
import { resolveBets } from "@/utils/payouts";
import { generateFictionalResult } from "@/utils/spinEngine";
import { generateMaskedName } from "@/utils/fakeNames";

export interface CommunityWinEntry {
  id: string;
  name: string;
  amount: number;
}

interface RouletteState {
  // Economía ficticia
  balance: number;
  totalStaked: number;
  totalProfit: number;
  lastRoundProfit: number;
  currentStreak: number; // positivo = rachas ganadoras, negativo = perdedoras
  roundsPlayed: number;
  sessionStart: number;

  // Apuestas activas de la ronda
  bets: BetsMap;
  selectedChip: number;

  // Motor de ronda
  phase: SpinPhase;
  countdown: number;
  history: SpinResult[];
  lastResult: SpinResult | null;
  lastWinningKeys: BetKey[];
  autoPlay: boolean;
  autoPlayBets: BetsMap | null;

  // UI
  notifications: RoundNotification[];
  communityWins: CommunityWinEntry[];

  // Acciones
  setSelectedChip: (v: number) => void;
  placeBet: (key: BetKey) => void;
  clearBets: () => void;
  startRound: () => void;
  tickCountdown: () => void;
  beginSpin: () => SpinResult;
  finishSpin: (result: SpinResult) => void;
  toggleAutoPlay: () => void;
  applyAutoPlayBets: () => boolean;
  resetSimulation: () => void;
  pushNotification: (n: Omit<RoundNotification, "id">) => void;
  dismissNotification: (id: string) => void;
}

const MAX_NOTIFICATIONS = 4;

export const useRouletteStore = create<RouletteState>((set, get) => ({
  balance: STARTING_BALANCE,
  totalStaked: 0,
  totalProfit: 0,
  lastRoundProfit: 0,
  currentStreak: 0,
  roundsPlayed: 0,
  sessionStart: Date.now(),

  bets: {},
  selectedChip: 25,

  phase: "betting",
  countdown: 0,
  history: [],
  lastResult: null,
  lastWinningKeys: [],
  autoPlay: false,
  autoPlayBets: null,

  notifications: [],
  communityWins: [],

  setSelectedChip: (v) => set({ selectedChip: v }),

  placeBet: (key) => {
    const { selectedChip, balance, bets, phase } = get();
    if (phase !== "betting") return;
    const totalCurrentlyBet = Object.values(bets).reduce((a: number, b) => a + (b ?? 0), 0);
    if (totalCurrentlyBet + selectedChip > balance) {
      get().pushNotification({
        kind: "loss",
        title: "Saldo insuficiente",
        subtitle: "No hay fondos suficientes para esa ficha",
      });
      return;
    }
    set({
      bets: { ...bets, [key]: (bets[key] ?? 0) + selectedChip },
    });
    get().pushNotification({ kind: "bet", title: "Apuesta aceptada", subtitle: `$${selectedChip} colocados` });
  },

  clearBets: () => set({ bets: {} }),

  startRound: () => {
    if (get().phase !== "betting") return;
    set({ phase: "countdown", countdown: 5 });
  },

  tickCountdown: () => {
    const { countdown } = get();
    if (countdown <= 1) {
      set({ countdown: 0, phase: "spinning" });
    } else {
      set({ countdown: countdown - 1 });
    }
  },

  beginSpin: () => {
    const result = generateFictionalResult();
    return result;
  },

  finishSpin: (result) => {
    const { bets, balance, totalProfit, currentStreak, roundsPlayed, history } = get();
    const breakdown = resolveBets(bets, result);
    const won = breakdown.netProfit > 0;

    const newBalance = balance - breakdown.totalStaked + breakdown.totalReturn;
    const newStreak = won ? Math.max(1, currentStreak + 1) : Math.min(-1, currentStreak - 1);

    set({
      phase: "result",
      lastResult: result,
      lastWinningKeys: breakdown.winningKeys,
      balance: newBalance,
      totalStaked: get().totalStaked + breakdown.totalStaked,
      totalProfit: totalProfit + breakdown.netProfit,
      lastRoundProfit: breakdown.netProfit,
      currentStreak: breakdown.totalStaked === 0 ? currentStreak : newStreak,
      roundsPlayed: roundsPlayed + 1,
      history: [result, ...history].slice(0, 40),
    });

    // Actividad de la mesa: entrada de ejemplo cada vez que termina una ronda
    const communityEntry: CommunityWinEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: generateMaskedName(),
      amount: Math.round((200 + Math.random() * 7800) / 50) * 50,
    };
    set({ communityWins: [communityEntry, ...get().communityWins].slice(0, 8) });

    if (breakdown.totalStaked > 0) {
      if (won) {
        get().pushNotification({
          kind: "win",
          title: `+$${breakdown.netProfit.toLocaleString("es-MX")}`,
          subtitle: "Ganancia registrada",
        });
        if (newStreak >= 3) {
          get().pushNotification({ kind: "streak", title: "Racha positiva", subtitle: `${newStreak} rondas seguidas` });
        }
      } else {
        get().pushNotification({ kind: "loss", title: "Ronda perdida", subtitle: "Saldo actualizado" });
      }
    }

    // Preparar siguiente ronda
    setTimeout(() => {
      set({ bets: {}, phase: "betting" });
      get().pushNotification({ kind: "info", title: "Nueva ronda", subtitle: "Coloca tus apuestas" });
    }, 2600);
  },

  toggleAutoPlay: () => {
    const { autoPlay, bets } = get();
    if (!autoPlay) {
      if (Object.keys(bets).length === 0) {
        get().pushNotification({
          kind: "info",
          title: "Coloca una apuesta base",
          subtitle: "Auto Play repite la misma apuesta cada ronda",
        });
        return;
      }
      set({ autoPlay: true, autoPlayBets: { ...bets } });
    } else {
      set({ autoPlay: false, autoPlayBets: null });
    }
  },

  applyAutoPlayBets: () => {
    const { autoPlayBets, balance } = get();
    if (!autoPlayBets) return false;
    const total = Object.values(autoPlayBets).reduce((a: number, b) => a + (b ?? 0), 0);
    if (total > balance) {
      set({ autoPlay: false, autoPlayBets: null });
      get().pushNotification({ kind: "loss", title: "Auto Play detenido", subtitle: "Saldo insuficiente" });
      return false;
    }
    set({ bets: { ...autoPlayBets } });
    return true;
  },

  resetSimulation: () =>
    set({
      balance: STARTING_BALANCE,
      totalStaked: 0,
      totalProfit: 0,
      lastRoundProfit: 0,
      currentStreak: 0,
      roundsPlayed: 0,
      sessionStart: Date.now(),
      bets: {},
      phase: "betting",
      countdown: 0,
      history: [],
      lastResult: null,
      lastWinningKeys: [],
      autoPlay: false,
      autoPlayBets: null,
      notifications: [],
      communityWins: [],
    }),

  pushNotification: (n) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set({ notifications: [...get().notifications, { ...n, id }].slice(-MAX_NOTIFICATIONS) });
    setTimeout(() => get().dismissNotification(id), 3200);
  },

  dismissNotification: (id) => set({ notifications: get().notifications.filter((n) => n.id !== id) }),
}));
