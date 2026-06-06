import type { Metadata } from "next";
import { Spectral, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Prose — the argument, set like a printed monograph.
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

// Labels and titles — drafting grotesk.
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

// Everything numbered — readouts, dials, dimensions.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PhysikArt: fine-tuning made visible",
  description:
    "An exhibition of mathematical phenomena whose beauty lives on a knife-edge. The very hairs of your head are all numbered.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spectral.variable} ${grotesk.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
