import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import IconSprite from "@/components/IconSprite";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BetFury Clone | UI Demo",
  description:
    "Educational UI clone of betfury.so built with Next.js, reusing the real markup structure and stylesheet for visual fidelity.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={montserrat.variable}>
      <head>
        <link rel="stylesheet" href="/styles/betfury-style.css" />
        <link rel="stylesheet" href="/styles/betfury-game.css" />
      </head>
      <body>
        <div id="__nuxt">
          <IconSprite />
          {children}
        </div>
      </body>
    </html>
  );
}
