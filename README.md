# Noir Royale — Simulador de Ruleta Europea (Demo)

Simulación web **totalmente ficticia y local** de una ruleta europea, construida como pieza de demostración de producto. No se conecta a ningún casino, proveedor de apuestas ni API externa: todos los números, saldos y estadísticas se generan en el navegador del usuario únicamente con fines ilustrativos.

> ⚠️ **Esto no es un producto de apuestas real.** No procesa dinero real, no tiene KYC, no tiene backend de pagos y no debe usarse para apostar.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** — sistema de diseño "Noir Royale" (negro, grafito, dorado, granate, cristal)
- **Framer Motion** — micro-interacciones, historial, notificaciones
- **Zustand** — estado global de la simulación (saldo, apuestas, historial, HUD)
- **Canvas 2D** para la rueda (elegido sobre Three.js por rendimiento: 60 FPS estables sin overhead de WebGL/GPU para una escena 2D circular)
- **Web Audio API** — todos los sonidos son sintetizados en tiempo real con osciladores; no hay archivos de audio externos

## Cómo ejecutar localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Optimizado para escritorio (1920×1080 en adelante); funciona en pantallas menores pero la experiencia principal está pensada para monitores grandes.

Para una build de producción:

```bash
npm run build
npm start
```

## Estructura del proyecto

```
app/                     Entrypoint de Next.js (layout, página principal, estilos globales)
src/
  components/
    wheel/                RouletteWheel.tsx — rueda en canvas con física de desaceleración
    history/               Historial de resultados (panel izquierdo)
    betting/                Panel de fichas/acciones + mesa de apuestas completa
    hud/                    HUD persistente (saldo, ROI, racha, tiempo jugando…)
    stats/                  Estadísticas, mapa de calor, números calientes/fríos
    notifications/          Notificaciones flotantes tipo casino
    layout/                 Componentes de layout reutilizables (GlassPanel)
  hooks/                  useRouletteEngine (orquestación de rondas), useSound (Web Audio API)
  store/                  useRouletteStore.ts — estado global (Zustand)
  constants/              Geometría de la rueda, tabla de pagos, valores de fichas
  utils/                  Resolución de apuestas/pagos, generador de resultados, formato
  types/                  Tipos TypeScript del dominio
```

## Notas de diseño

- La rueda gira de forma continua a velocidad constante; la bola arranca con velocidad angular alta en sentido contrario y desacelera con un *easing* `easeOutQuint`, además de "caer" gradualmente hacia el aro de descanso — el ángulo final se calcula matemáticamente para que coincida siempre con el número ganador ya determinado.
- El resultado de cada ronda se genera con `crypto.getRandomValues` cuando está disponible, como una fuente de aleatoriedad de calidad demo — sigue siendo 100% local y ficticia, no hay auditoría de juego real detrás.
- La tabla de apuestas cubre pleno (0-36), rojo/negro, par/impar, alto/bajo, docenas y columnas, con el pago estándar de cada una reflejado en `src/constants/roulette.ts`.
