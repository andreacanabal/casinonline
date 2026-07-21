import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Noir Royale — Simulador de Ruleta Europea (Demo)",
  description:
    "Simulación 100% ficticia y local de una ruleta europea con fines demostrativos. Sin dinero real, sin conexión a casinos ni apuestas reales.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body bg-void text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
