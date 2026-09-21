// Content for the INUS token page (/about-inus).
//
// The figures are a coherent launch snapshot rather than the captured BetFury
// numbers: INUS launches on ARC with a 1B max supply, all of it minted, so
// total supply equals max supply and nothing has been burned yet. Everything
// derived from those two lines is calculated from them, not copied.

export type TokenFact = { label: string; value: string; highlight?: boolean };

export const tokenAssets = {
  heroBg: "/images/token/hero-bg.0cd37da5.webp",
  heroCoins: "/images/token/hero.46c584a4.webp",
  getArt: "/images/token/get-art.0db7807f.webp",
  tokenomics: "/images/token/tokenomics.4134b384.webp",
  coin: "/images/coins/inus.97293ec5.png",
};

export const useCases = [
  {
    icon: "/images/token/use-betting.8da52a2a.webp",
    title: "Betting",
    text: "Make bets in InuSlots Originals, top casino games and sports with high odds and other great features",
    links: [
      { label: "Casino", href: "/casino" },
      { label: "Sport", href: "/sports" },
    ],
  },
  {
    icon: "/images/token/use-staking.74860140.webp",
    title: "INUS Staking",
    badge: "APY 29.46%",
    text: "Double the staking APY and boost your rewards by converting INUS to stINUS",
    links: [{ label: "Go to INUS Staking", href: "/staking" }],
  },
  {
    icon: "/images/token/use-trading.84f6c728.webp",
    title: "Trading",
    text: "Exchange top crypto quickly and easily with Crypto Swap on InuSlots",
    links: [{ label: "Go to Crypto Swap", href: "/crypto-swap" }],
  },
];

export const deflationStrategies = [
  {
    href: "/staking",
    icon: "/images/token/icon-burn.b2620fd1.webp",
    title: "Buyback & Burn",
    text: "A part of purchased tokens are burned every month",
  },
  {
    href: "/staking",
    icon: "/images/token/icon-lock.06e130f7.webp",
    title: "Buyback & Lock",
    text: "INUS are bought back regularly and locked in Treasury",
  },
  {
    href: "/staking",
    icon: "/images/token/icon-coinlock.b2263caa.webp",
    title: "INUS lock",
    text: "Lock INUS tokens to double your staking APY",
  },
];

const MAX_SUPPLY = 1_000_000_000;
const TOTAL_SUPPLY = 1_000_000_000;
// Fully circulating at launch: nothing is held back, so this tracks total
// supply rather than being a separate number to keep in sync.
const CIRCULATING = TOTAL_SUPPLY;
const STAKED = 180_000_000;
// Staked tokens stay circulating — they are user-held — so STAKED does not
// contradict CIRCULATING. LOCKED would, which is why it is zero here.
const LOCKED = 0;

// Thin spaces between groups, matching the captured page's number formatting.
const inus = (n: number) => `${n.toLocaleString("en-US").replace(/,/g, " ")} INUS`;
const pct = (part: number, whole: number) => `${((part / whole) * 100).toFixed(2)} %`;

export const tokenStats = {
  price: "$0.010000",
  contractUrl: "https://arcscan.io/",

  tokenomics: [
    { label: "Chain:", value: "ARC Network" },
    { label: "Max supply:", value: inus(MAX_SUPPLY) },
    { label: "Total supply:", value: inus(TOTAL_SUPPLY) },
    { label: "Circulating supply:", value: inus(CIRCULATING), highlight: true },
    { label: "Total INUS staked:", value: inus(STAKED) },
    { label: "Total INUS locked:", value: inus(LOCKED) },
    { label: "Locked from total supply:", value: pct(LOCKED, TOTAL_SUPPLY) },
  ] satisfies TokenFact[],
};
