"use client";

import { useCallback, useRef } from "react";

type SoundName = "chip" | "spinTick" | "countdown" | "win" | "ballDrop" | "notify";

/**
 * Motor de sonido 100% sintetizado con Web Audio API.
 * No se cargan archivos de audio externos: todo se genera localmente
 * mediante osciladores, lo cual mantiene la demo autocontenida.
 */
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const tone = useCallback(
    (freq: number, duration: number, type: OscillatorType = "sine", gainPeak = 0.08, delay = 0) => {
      const ctx = getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    },
    [getCtx]
  );

  const play = useCallback(
    (name: SoundName) => {
      switch (name) {
        case "chip":
          tone(880, 0.09, "triangle", 0.07);
          tone(1320, 0.07, "triangle", 0.04, 0.03);
          break;
        case "spinTick":
          tone(220, 0.04, "square", 0.02);
          break;
        case "countdown":
          tone(660, 0.12, "sine", 0.06);
          break;
        case "ballDrop":
          tone(140, 0.25, "sine", 0.1);
          tone(90, 0.3, "sine", 0.08, 0.08);
          break;
        case "win":
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.3, "triangle", 0.07, i * 0.09));
          break;
        case "notify":
          tone(1000, 0.06, "sine", 0.04);
          break;
      }
    },
    [tone]
  );

  return { play };
}
