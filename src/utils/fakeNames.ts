// Generador de nombres enmascarados para el feed de actividad de la mesa.
// Son datos de ejemplo generados localmente, no representan usuarios reales.
const FIRST_FRAGMENTS = [
  "Die", "Mar", "Jos", "Ana", "Luis", "Car", "Sof", "Fer",
  "Gab", "Val", "Rod", "Este", "Nat", "Mig", "Lau", "Ped",
];

export function generateMaskedName(): string {
  const frag = FIRST_FRAGMENTS[Math.floor(Math.random() * FIRST_FRAGMENTS.length)];
  const stars = "*".repeat(2 + Math.floor(Math.random() * 3));
  const num = Math.floor(Math.random() * 90) + 10;
  return `${frag}${stars}${num}`;
}
