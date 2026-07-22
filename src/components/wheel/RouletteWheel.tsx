"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { WHEEL_ORDER, getNumberColor, SPIN_DURATION_MS } from "@/constants/roulette";
import { SpinResult, SpinPhase } from "@/types/roulette";
import { useSound } from "@/hooks/useSound";

interface Props {
  phase: SpinPhase;
  targetResult: SpinResult | null;
  size?: number;
}

const SLICE_ANGLE = (Math.PI * 2) / WHEEL_ORDER.length;
const TRAIL_LENGTH = 8;

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Perturbación de "rebote contra deflectores": una oscilación amortiguada
 * que se superpone al ángulo ideal de la bola. Se anula por completo antes
 * de t=1 para que la bola siempre termine exactamente en el número objetivo,
 * pero da la sensación de golpes irregulares mientras va perdiendo energía.
 */
function bounceOffset(t: number, seed: number) {
  if (t >= 0.97) return 0;
  const decay = Math.pow(1 - t, 1.5);
  const windowFn = Math.sin(Math.min(1, t / 0.97) * Math.PI);
  const wobble =
    Math.sin(t * 46 + seed) * 0.03 +
    Math.sin(t * 97 + seed * 1.7) * 0.015 +
    Math.sin(t * 23 + seed * 0.5) * 0.022;
  return wobble * decay * windowFn;
}

export default function RouletteWheel({ phase, targetResult, size = 560 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const wheelAngleRef = useRef(0);
  const trailRef = useRef<{ angle: number; radius: number }[]>([]);
  const ballStateRef = useRef({
    animating: false,
    startTime: 0,
    ballStartAngle: 0,
    totalSweep: 0,
    wheelOmega: 0.42,
    landed: false,
    seed: 0,
    lastBounceMag: 0,
  });
  const { play, playTick } = useSound();

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
    const bowlR = size * 0.5;
    const pianoEdgeR = size * 0.485; // borde exterior negro piano
    const woodInnerR = size * 0.425; // madera lacada roja
    const trackR = size * 0.405; // pista cromada donde corre la bola
    const pocketOuterR = size * 0.375;
    const pocketInnerR = size * 0.25;
    const deflectorR = size * 0.44;
    const ballOuterR = trackR - size * 0.015;
    const ballRestR = size * 0.29;
    const hubR = size * 0.13;

    let lastTs = performance.now();
    let lastTickBucket = -1;

    function drawPianoAndWood(wheelAngle: number) {
      if (!ctx) return;
      // Borde exterior negro piano, muy brillante
      const pianoGrad = ctx.createRadialGradient(center - bowlR * 0.3, center - bowlR * 0.35, bowlR * 0.1, center, center, bowlR);
      pianoGrad.addColorStop(0, "#2a2a2e");
      pianoGrad.addColorStop(0.4, "#0d0d10");
      pianoGrad.addColorStop(1, "#020202");
      ctx.beginPath();
      ctx.arc(center, center, bowlR, 0, Math.PI * 2);
      ctx.fillStyle = pianoGrad;
      ctx.fill();

      // Franja de luz especular sobre el piano black (streak fino)
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, bowlR, 0, Math.PI * 2);
      ctx.arc(center, center, pianoEdgeR, 0, Math.PI * 2, true);
      ctx.clip();
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.beginPath();
      ctx.ellipse(center - bowlR * 0.25, center - bowlR * 0.55, bowlR * 0.9, bowlR * 0.12, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Madera lacada rojo vino oscuro
      const woodGrad = ctx.createRadialGradient(center - woodInnerR * 0.3, center - woodInnerR * 0.4, woodInnerR * 0.1, center, center, pianoEdgeR);
      woodGrad.addColorStop(0, "#7a1a22");
      woodGrad.addColorStop(0.45, "#4a0f16");
      woodGrad.addColorStop(1, "#22060a");
      ctx.beginPath();
      ctx.arc(center, center, pianoEdgeR, 0, Math.PI * 2);
      ctx.fillStyle = woodGrad;
      ctx.fill();

      // Vetas de laca sutiles
      ctx.save();
      ctx.translate(center, center);
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        ctx.strokeStyle = i % 3 === 0 ? "rgba(255,180,180,0.05)" : "rgba(0,0,0,0.08)";
        ctx.lineWidth = size * 0.005;
        ctx.beginPath();
        ctx.arc(0, 0, (pianoEdgeR + woodInnerR) / 2, a, a + 0.03);
        ctx.stroke();
      }
      ctx.restore();

      // Barrido de brillo lento (reflejo dinámico sobre la laca)
      if (ctx.createConicGradient) {
        const sheen = ctx.createConicGradient(wheelAngle * 0.1, center, center);
        sheen.addColorStop(0, "rgba(255,255,255,0)");
        sheen.addColorStop(0.05, "rgba(255,255,255,0.22)");
        sheen.addColorStop(0.1, "rgba(255,255,255,0)");
        sheen.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.arc(center, center, pianoEdgeR, 0, Math.PI * 2);
        ctx.arc(center, center, woodInnerR, 0, Math.PI * 2, true);
        ctx.fillStyle = sheen;
        ctx.fill();
      }
    }

    function drawChromeTrack() {
      if (!ctx) return;
      const trackGrad = ctx.createRadialGradient(center, center - trackR * 0.4, trackR * 0.15, center, center, woodInnerR);
      trackGrad.addColorStop(0, "#f5f5f7");
      trackGrad.addColorStop(0.3, "#c9c9d0");
      trackGrad.addColorStop(0.55, "#7d7d85");
      trackGrad.addColorStop(0.8, "#3a3a40");
      trackGrad.addColorStop(1, "#161619");
      ctx.beginPath();
      ctx.arc(center, center, woodInnerR, 0, Math.PI * 2);
      ctx.arc(center, center, pocketOuterR + size * 0.008, 0, Math.PI * 2, true);
      ctx.fillStyle = trackGrad;
      ctx.fill();

      // Deflectores cromados
      ctx.save();
      ctx.translate(center, center);
      const deflectors = 8;
      for (let i = 0; i < deflectors; i++) {
        const a = (i / deflectors) * Math.PI * 2;
        ctx.save();
        ctx.rotate(a);
        ctx.translate(deflectorR, 0);
        ctx.rotate(Math.PI / 2);
        const dGrad = ctx.createLinearGradient(-5, -7, 5, 7);
        dGrad.addColorStop(0, "#ffffff");
        dGrad.addColorStop(0.5, "#b8b8c0");
        dGrad.addColorStop(1, "#3d3d44");
        ctx.fillStyle = dGrad;
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.013);
        ctx.lineTo(size * 0.0075, 0);
        ctx.lineTo(0, size * 0.013);
        ctx.lineTo(-size * 0.0075, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    function drawIvoryNumber(text: string) {
      if (!ctx) return;
      ctx.font = `700 ${size * 0.022}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // bisel fino: sombra oscura desplazada + cara marfil
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText(text, 0.6, 0.9);
      ctx.fillStyle = "#F5EFE0";
      ctx.fillText(text, 0, 0);
    }

    function drawWheel(wheelAngle: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);

      drawPianoAndWood(wheelAngle);
      drawChromeTrack();

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
        const pocketGrad = ctx.createRadialGradient(0, 0, pocketInnerR * 0.6, 0, 0, pocketOuterR);
        if (color === "red") {
          pocketGrad.addColorStop(0, "#8f1626");
          pocketGrad.addColorStop(1, "#3d0810");
        } else if (color === "black") {
          pocketGrad.addColorStop(0, "#1c1c1f");
          pocketGrad.addColorStop(1, "#050506");
        } else {
          pocketGrad.addColorStop(0, "#146b3f");
          pocketGrad.addColorStop(1, "#0a2e1a");
        }
        ctx.fillStyle = pocketGrad;
        ctx.fill();

        // Separador metálico cromado
        ctx.strokeStyle = "rgba(230,230,236,0.5)";
        ctx.lineWidth = size * 0.0028;
        ctx.stroke();

        ctx.save();
        ctx.rotate(start + SLICE_ANGLE / 2);
        ctx.translate(pocketOuterR - size * 0.027, 0);
        ctx.rotate(Math.PI / 2);
        drawIvoryNumber(String(num));
        ctx.restore();
      }

      // Anillo interior
      const innerGrad = ctx.createRadialGradient(-hubR * 0.3, -hubR * 0.3, hubR * 0.1, 0, 0, pocketInnerR);
      innerGrad.addColorStop(0, "#2c2c31");
      innerGrad.addColorStop(1, "#0a0a0c");
      ctx.beginPath();
      ctx.arc(0, 0, pocketInnerR, 0, Math.PI * 2);
      ctx.fillStyle = innerGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(230,230,236,0.55)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rayos cromados del turret
      const spokes = 8;
      for (let i = 0; i < spokes; i++) {
        const a = (i / spokes) * Math.PI * 2;
        const grad = ctx.createLinearGradient(
          Math.cos(a) * hubR,
          Math.sin(a) * hubR,
          Math.cos(a) * pocketInnerR,
          Math.sin(a) * pocketInnerR
        );
        grad.addColorStop(0, "#f0f0f3");
        grad.addColorStop(1, "#3a3a40");
        ctx.strokeStyle = grad;
        ctx.lineWidth = size * 0.006;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * hubR, Math.sin(a) * hubR);
        ctx.lineTo(Math.cos(a) * pocketInnerR, Math.sin(a) * pocketInnerR);
        ctx.stroke();
      }

      ctx.restore();

      // Hub cromado pulido tipo espejo
      const hubGrad = ctx.createRadialGradient(center - hubR * 0.35, center - hubR * 0.4, hubR * 0.08, center, center, hubR);
      hubGrad.addColorStop(0, "#ffffff");
      hubGrad.addColorStop(0.3, "#d5d5da");
      hubGrad.addColorStop(0.62, "#8a8a92");
      hubGrad.addColorStop(1, "#26262b");
      ctx.beginPath();
      ctx.arc(center, center, hubR, 0, Math.PI * 2);
      ctx.fillStyle = hubGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(center, center, hubR * 0.34, 0, Math.PI * 2);
      const capGrad = ctx.createRadialGradient(center - 4, center - 5, 1, center, center, hubR * 0.34);
      capGrad.addColorStop(0, "#ffffff");
      capGrad.addColorStop(1, "#9a9aa2");
      ctx.fillStyle = capGrad;
      ctx.fill();
    }

    function drawBall(ballAngle: number, radius: number, alpha = 1) {
      if (!ctx) return;
      const bx = center + Math.cos(ballAngle) * radius;
      const by = center + Math.sin(ballAngle) * radius;
      const r = size * 0.0135;
      ctx.save();
      ctx.globalAlpha = alpha;
      const grad = ctx.createRadialGradient(bx - r * 0.4, by - r * 0.4, 0.5, bx, by, r);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.55, "#F5EFE0");
      grad.addColorStop(1, "#a8a196");
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = "rgba(255,255,255,0.85)";
      ctx.shadowBlur = alpha === 1 ? 10 : 3;
      ctx.fill();
      ctx.restore();
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
        const bounce = bounceOffset(t, bs.seed);
        const angle = bs.ballStartAngle - eased * bs.totalSweep + bounce;

        const radiusT = Math.min(1, t / 0.82);
        const radius = ballOuterR - easeOutCubic(radiusT) * (ballOuterR - ballRestR);

        trailRef.current.unshift({ angle, radius });
        if (trailRef.current.length > TRAIL_LENGTH) trailRef.current.pop();
        if (t < 0.75) {
          trailRef.current.forEach((p, i) => {
            if (i === 0) return;
            drawBall(p.angle, p.radius, (1 - i / TRAIL_LENGTH) * 0.35);
          });
        }

        drawBall(angle, radius);

        // Tick dinámico: más rápido y agudo al inicio, más lento y grave al final
        const speedRatio = Math.pow(1 - t, 4);
        const tickInterval = 55 + t * 320;
        const bucket = Math.floor(elapsed / tickInterval);
        if (bucket !== lastTickBucket && t < 0.92) {
          lastTickBucket = bucket;
          playTick(speedRatio);
        }

        // Golpe de deflector cuando el rebote cruza un umbral (efecto de impacto)
        const bounceMag = Math.abs(bounce);
        if (bounceMag > 0.014 && bs.lastBounceMag <= 0.014 && t > 0.3 && t < 0.93) {
          play("deflector");
        }
        bs.lastBounceMag = bounceMag;

        if (t >= 1 && !bs.landed) {
          bs.landed = true;
          bs.animating = false;
          trailRef.current = [];
          play("ballDrop");
        }
      } else if (targetResult && phase === "result") {
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

  useEffect(() => {
    if (phase !== "spinning" || !targetResult) return;
    const bs = ballStateRef.current;
    const idx = WHEEL_ORDER.indexOf(targetResult.number);
    const pocketAngleLocal = idx * SLICE_ANGLE;

    const wheelAngleAtStart = wheelAngleRef.current;
    const wheelAngleAtEnd = wheelAngleAtStart + bs.wheelOmega * (SPIN_DURATION_MS / 1000);
    const targetAngle = (wheelAngleAtEnd + pocketAngleLocal) % (Math.PI * 2);

    const ballStartAngle = wheelAngleAtStart - Math.PI * 0.6;
    const laps = 7;
    let sweep = ((ballStartAngle - targetAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    sweep += laps * Math.PI * 2;

    trailRef.current = [];
    ballStateRef.current = {
      ...bs,
      animating: true,
      landed: false,
      startTime: performance.now(),
      ballStartAngle,
      totalSweep: sweep,
      seed: Math.random() * 1000,
      lastBounceMag: 0,
    };
  }, [phase, targetResult]);

  return (
    <div className="relative flex items-center justify-center" style={{ perspective: 1400 }}>
      <div
        className="absolute rounded-full blur-3xl opacity-35 pointer-events-none"
        style={{ width: size * 1.1, height: size * 1.1, background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)" }}
      />
      <div
        className="absolute rounded-full pointer-events-none animate-[spin_20s_linear_infinite]"
        style={{
          width: size * 1.02,
          height: size * 1.02,
          background: "conic-gradient(from 0deg, rgba(255,255,255,0.1), transparent 18%, transparent 82%, rgba(255,255,255,0.1))",
          filter: "blur(2px)",
        }}
      />
      {/* Movimiento cinemático casi imperceptible, como una cámara fija con micro-respiración */}
      <motion.div
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateZ: [0, 0.5, 0, -0.5, 0], scale: [1, 1.005, 1, 1.004, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      >
        <div style={{ transform: "rotateX(32deg)" }}>
          <canvas ref={canvasRef} className="relative" style={{ filter: "drop-shadow(0 40px 55px rgba(0,0,0,0.8))" }} />
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.16) 0%, transparent 28%, transparent 74%, rgba(255,255,255,0.06) 100%)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
