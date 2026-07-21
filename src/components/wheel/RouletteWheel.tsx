"use client";

import { useEffect, useRef } from "react";
import { WHEEL_ORDER, getNumberColor, SPIN_DURATION_MS } from "@/constants/roulette";
import { SpinResult, SpinPhase } from "@/types/roulette";
import { useSound } from "@/hooks/useSound";

interface Props {
  phase: SpinPhase;
  targetResult: SpinResult | null;
  size?: number;
}

const SLICE_ANGLE = (Math.PI * 2) / WHEEL_ORDER.length;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

export default function RouletteWheel({ phase, targetResult, size = 560 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const wheelAngleRef = useRef(0);
  const ballStateRef = useRef({
    animating: false,
    startTime: 0,
    ballStartAngle: 0,
    totalSweep: 0,
    wheelOmega: 0.5, // rad/s — velocidad constante de la rueda
    wheelAngleAtStart: 0,
    landed: false,
  });
  const { play } = useSound();

  // Bucle continuo: la rueda siempre gira lentamente; la bola gira encima cuando corresponde
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const center = size / 2;
    const outerR = size * 0.48;
    const pocketOuterR = size * 0.44;
    const pocketInnerR = size * 0.3;
    const ballOuterR = size * 0.4;
    const ballRestR = size * 0.335;
    const hubR = size * 0.16;

    let lastTs = performance.now();
    let lastTickSecond = -1;

    function drawWheel(wheelAngle: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);

      // Aro dorado exterior
      const rimGrad = ctx.createLinearGradient(0, 0, size, size);
      rimGrad.addColorStop(0, "#8A722A");
      rimGrad.addColorStop(0.5, "#F4D06F");
      rimGrad.addColorStop(1, "#8A722A");
      ctx.beginPath();
      ctx.arc(center, center, outerR, 0, Math.PI * 2);
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // Pockets
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(wheelAngle);
      for (let i = 0; i < WHEEL_ORDER.length; i++) {
        const num = WHEEL_ORDER[i];
        const color = getNumberColor(num);
        const start = i * SLICE_ANGLE - SLICE_ANGLE / 2;
        const end = start + SLICE_ANGLE;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, pocketOuterR, start, end);
        ctx.closePath();
        ctx.fillStyle = color === "red" ? "#9E1B32" : color === "black" ? "#111114" : "#0E6B3C";
        ctx.fill();
        ctx.strokeStyle = "rgba(212,175,55,0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Número
        ctx.save();
        ctx.rotate(start + SLICE_ANGLE / 2);
        ctx.translate(pocketOuterR - 16, 0);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = "#F4E9C9";
        ctx.font = `600 ${size * 0.024}px var(--font-mono), monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(num), 0, 0);
        ctx.restore();
      }

      // Anillo interior
      ctx.beginPath();
      ctx.arc(0, 0, pocketInnerR, 0, Math.PI * 2);
      ctx.fillStyle = "#1A1A1E";
      ctx.fill();
      ctx.strokeStyle = "rgba(212,175,55,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      // Hub central con gradiente radial de vidrio
      const hubGrad = ctx.createRadialGradient(center, center - hubR * 0.3, hubR * 0.1, center, center, hubR);
      hubGrad.addColorStop(0, "#3a3a40");
      hubGrad.addColorStop(0.6, "#1c1c20");
      hubGrad.addColorStop(1, "#0a0a0c");
      ctx.beginPath();
      ctx.arc(center, center, hubR, 0, Math.PI * 2);
      ctx.fillStyle = hubGrad;
      ctx.fill();
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    function drawBall(ballAngle: number, radius: number) {
      if (!ctx) return;
      const bx = center + Math.cos(ballAngle) * radius;
      const by = center + Math.sin(ballAngle) * radius;
      const grad = ctx.createRadialGradient(bx - 2, by - 2, 0.5, bx, by, size * 0.014);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(1, "#c9c9c9");
      ctx.beginPath();
      ctx.arc(bx, by, size * 0.013, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = "rgba(255,255,255,0.6)";
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function frame(ts: number) {
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      const bs = ballStateRef.current;
      wheelAngleRef.current += bs.wheelOmega * dt;
      const wheelAngle = wheelAngleRef.current;

      drawWheel(wheelAngle);

      if (bs.animating) {
        const elapsed = ts - bs.startTime;
        const t = Math.min(1, elapsed / SPIN_DURATION_MS);
        const eased = easeOutQuint(t);
        const angle = bs.ballStartAngle - eased * bs.totalSweep;

        // radio: se mantiene afuera y en el último tramo cae hacia el aro de descanso
        const radiusT = Math.min(1, t / 0.82);
        const radius = ballOuterR - easeOutCubic(radiusT) * (ballOuterR - ballRestR);

        drawBall(angle, radius);

        // tick sonoro sutil mientras gira rápido
        const currentSecond = Math.floor(elapsed / 220);
        if (currentSecond !== lastTickSecond && t < 0.85) {
          lastTickSecond = currentSecond;
          play("spinTick");
        }

        if (t >= 1 && !bs.landed) {
          bs.landed = true;
          bs.animating = false;
          play("ballDrop");
        }
      } else if (targetResult && phase === "result") {
        // Bola en reposo sobre el número ganador, sincronizada con la rueda en movimiento
        const idx = WHEEL_ORDER.indexOf(targetResult.number);
        const pocketAngleLocal = idx * SLICE_ANGLE;
        const angle = wheelAngle + pocketAngleLocal;
        drawBall(angle, ballRestR);
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  // Disparar la animación de la bola cuando llega un nuevo resultado objetivo
  useEffect(() => {
    if (phase !== "spinning" || !targetResult) return;
    const bs = ballStateRef.current;
    const idx = WHEEL_ORDER.indexOf(targetResult.number);
    const pocketAngleLocal = idx * SLICE_ANGLE;

    const wheelAngleAtStart = wheelAngleRef.current;
    const wheelAngleAtEnd = wheelAngleAtStart + bs.wheelOmega * (SPIN_DURATION_MS / 1000);
    const targetAngle = (wheelAngleAtEnd + pocketAngleLocal) % (Math.PI * 2);

    const ballStartAngle = wheelAngleAtStart - Math.PI * 0.6; // arranca "adelantada" en sentido contrario
    const laps = 7;
    let sweep = ((ballStartAngle - targetAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    sweep += laps * Math.PI * 2;

    ballStateRef.current = {
      ...bs,
      animating: true,
      landed: false,
      startTime: performance.now(),
      ballStartAngle,
      totalSweep: sweep,
    };
  }, [phase, targetResult]);

  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ width: size * 1.05, height: size * 1.05, background: "radial-gradient(circle, rgba(212,175,55,0.25), transparent 70%)" }}
      />
      <canvas ref={canvasRef} className="relative drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]" />
      {/* Reflejo de cristal superior */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, transparent 35%, transparent 70%, rgba(255,255,255,0.04) 100%)",
        }}
      />
    </div>
  );
}
