"use client";

import { useCallback, useRef } from "react";

type SoundName = "chip" | "countdown" | "win" | "ballDrop" | "notify" | "deflector";

/**
 * Motor de sonido 100% sintetizado con Web Audio API.
 * No se cargan archivos de audio externos. El rodar de la bola se sintetiza
 * con ráfagas de ruido filtrado (en vez de un tono puro) para que suene a
 * una bola física recorriendo la pista, no a un beep electrónico.
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

  /**
   * Ráfaga de ruido filtrado — la base de un sonido de "rodar" físico
   * (bola, fricción, impacto sordo) en vez de un tono electrónico.
   */
  const noiseBurst = useCallback(
    (duration: number, filterFreq: number, gainPeak = 0.05, q = 1.4, type: BiquadFilterType = "bandpass") => {
      const ctx = getCtx();
      if (!ctx) return;
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = filterFreq;
      filter.Q.value = q;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(gainPeak, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
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
        case "countdown":
          tone(660, 0.12, "sine", 0.06);
          break;
        case "ballDrop":
          // golpe sordo de la bola cayendo al bolsillo + un par de rebotes cortos que se apagan
          noiseBurst(0.09, 260, 0.09, 1.1, "lowpass");
          noiseBurst(0.05, 900, 0.03, 3, "bandpass");
          break;
        case "deflector":
          tone(1600, 0.05, "square", 0.03);
          tone(700, 0.08, "triangle", 0.03, 0.01);
          break;
        case "win":
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.3, "triangle", 0.07, i * 0.09));
          break;
        case "notify":
          tone(1000, 0.06, "sine", 0.04);
          break;
      }
    },
    [tone, noiseBurst]
  );

  /**
   * Sonido de la bola rodando, modulado por velocidad (0 = casi detenida, 1 = velocidad máxima).
   * Se sintetiza con ruido filtrado para imitar la textura física de una bola
   * recorriendo una pista, no un beep. Más rápido → más agudo, más denso y más fuerte.
   */
  const playTick = useCallback(
    (speedRatio: number) => {
      const clamped = Math.max(0, Math.min(1, speedRatio));
      const freq = 650 + clamped * 2200;
      const gain = 0.025 + clamped * 0.055;
      const duration = 0.028 + clamped * 0.022;
      noiseBurst(duration, freq, gain, 1.8 + clamped * 1.5, "bandpass");
    },
    [noiseBurst]
  );

  return { play, playTick };
}
