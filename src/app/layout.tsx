import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import IconSprite from "@/components/IconSprite";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const TITLE = "InuSlots - Crypto Casino & Sportsbook";
const DESCRIPTION =
  "Play InuSlots Originals, thousands of slots and a full sportsbook with crypto. Stake INUS on Arc for daily rewards, provably fair games and payouts in minutes.";

// The icons and the share card are picked up from src/app by filename —
// favicon.ico, icon.png, apple-icon.png and opengraph-image.jpg — so they are
// deliberately absent here. See scripts/gen-site-icons.mjs.
/**
 * Social cards need absolute URLs. Without this Next falls back to
 * `http://localhost:0`, so every share link would point at a host that does not
 * exist — a build-time warning that only bites once the site is public.
 *
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL; anywhere else, set SITE_URL.
 */
const siteUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: TITLE,
    // Sub-pages set only their own name; this keeps the brand on the end.
    template: "%s | InuSlots",
  },
  description: DESCRIPTION,
  applicationName: "InuSlots",
  openGraph: {
    type: "website",
    siteName: "InuSlots",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  // The whole site is pre-launch placeholder content built on a captured
  // layout; it has no business turning up in search results yet.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={montserrat.variable}>
      <head>
        <link rel="stylesheet" href="/styles/betfury-style.css" />
        <link rel="stylesheet" href="/styles/betfury-game.css" />
        {/* Must stay last: it wins on cascade order, not specificity. */}
        <link rel="stylesheet" href="/styles/brand-semantic.css" />
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
