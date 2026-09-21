export const GRADIENTS: string[] = [
  "linear-gradient(135deg, #db2777, #f43f5e, #fb923c)",
  "linear-gradient(135deg, #6b21a8, #a21caf, #e11d48)",
  "linear-gradient(135deg, #4338ca, #2563eb, #06b6d4)",
  "linear-gradient(135deg, #047857, #0d9488, #84cc16)",
  "linear-gradient(135deg, #4d7c0f, #16a34a, #10b981)",
  "linear-gradient(135deg, #d97706, #ea580c, #dc2626)",
  "linear-gradient(135deg, #a21caf, #db2777, #facc15)",
  "linear-gradient(135deg, #c2410c, #dc2626, #eab308)",
  "linear-gradient(135deg, #1e40af, #4f46e5, #a855f7)",
  "linear-gradient(135deg, #1e293b, #334155, #475569)",
  "linear-gradient(135deg, #312e81, #1e40af, #4f46e5)",
  "linear-gradient(135deg, #064e3b, #047857, #14b8a6)",
];

export type GameItem = { href: string; name: string; top: boolean; image: string };
export type WinItem = { href: string; user: string; balance: string; image: string; avatar: string };
export type SportItem = { href: string; icon: string; name: string; hot: boolean };
export type CurrencyLogo = { name: string; src: string };

export const inhouseGames: GameItem[] = [
  {
    "href": "/casino/games/dice",
    "name": "Dice",
    "top": true,
    "image": "/images/originals/dice.177c1fc0.webp"
  },
  {
    "href": "/casino/games/spacedice",
    "name": "SpaceDice",
    "top": true,
    "image": "/images/originals/spacedice.21975714.webp"
  },
  {
    "href": "/futures/btc",
    "name": "Futures",
    "top": true,
    "image": "/images/originals/futures.5766fe52.webp"
  },
  {
    "href": "/casino/games/keno",
    "name": "Keno",
    "top": true,
    "image": "/images/originals/keno.65d0dd58.webp"
  },
  {
    "href": "/casino/games/mines",
    "name": "Mines",
    "top": true,
    "image": "/images/originals/mines.a3b10d7d.webp"
  },
  {
    "href": "/casino/games/inuheist",
    "name": "InuHeist",
    "top": false,
    "image": "/images/originals/inuheist.38e081f5.webp"
  },
  {
    "href": "/casino/games/litecrash",
    "name": "LiteCrash",
    "top": false,
    "image": "/images/originals/litecrash.d9f99668.webp"
  },
  {
    "href": "/casino/games/blackjack",
    "name": "Blackjack",
    "top": false,
    "image": "/images/originals/blackjack.72c8ea1d.webp"
  },
  {
    "href": "/casino/games/limbo",
    "name": "Limbo",
    "top": false,
    "image": "/images/originals/limbo.856d381f.webp"
  },
  {
    "href": "/casino/games/crash",
    "name": "Crash",
    "top": false,
    "image": "/images/originals/crash.bcd887bd.webp"
  },
  {
    "href": "/casino/games/roulette",
    "name": "Roulette",
    "top": false,
    "image": "/images/originals/roulette.fc4568cd.webp"
  },
  {
    "href": "/casino/games/plinko",
    "name": "Plinko",
    "top": false,
    "image": "/images/originals/plinko.eb370169.webp"
  },
  {
    "href": "/casino/games/coinflip",
    "name": "CoinFlip",
    "top": false,
    "image": "/images/originals/coinflip.9dc75854.webp"
  },
  {
    "href": "/casino/games/ring",
    "name": "Ring",
    "top": false,
    "image": "/images/originals/ring.f88adbf1.webp"
  },
  {
    "href": "/casino/games/tower",
    "name": "Tower",
    "top": false,
    "image": "/images/originals/tower.bd4f9e92.webp"
  },
  {
    "href": "/casino/games/cryptos",
    "name": "Cryptos",
    "top": false,
    "image": "/images/originals/cryptos.d086b1c9.webp"
  },
  {
    "href": "/casino/games/inupharaoh",
    "name": "InuPharaoh",
    "top": false,
    "image": "/images/originals/inupharaoh.e38fb103.webp"
  },
  {
    "href": "/casino/games/stairs",
    "name": "Stairs",
    "top": false,
    "image": "/images/originals/stairs.5a0acf96.webp"
  },
  {
    "href": "/casino/games/inuwild",
    "name": "InuWild",
    "top": false,
    "image": "/images/originals/inuwild.34c3161e.webp"
  },
  {
    "href": "/casino/games/hilo",
    "name": "HiLo",
    "top": false,
    "image": "/images/originals/hilo.409c67fe.webp"
  },
  {
    "href": "/casino/games/circle",
    "name": "Circle",
    "top": false,
    "image": "/images/originals/circle.18ea7cbf.webp"
  },
  {
    "href": "/casino/games/triple",
    "name": "Triple",
    "top": false,
    "image": "/images/originals/triple.82e0f8d3.webp"
  }
];

export const topSlots: GameItem[] = [
  {
    "href": "/casino/games/betfury-sugar-rush-1000-by-pragmatic-play",
    "name": "Sugar Rush 1000",
    "top": true,
    // Regenerated locally: the bfstatic tile carried the InuSlots raccoon and
    // wordmark. See scripts/gen-slot-thumbs.mjs.
    "image": "/images/slots/sugar-rush.64155a18.webp"
  },
  {
    "href": "/casino/games/3-witch-pots-by-endorphina",
    "name": "3 Witch Pots",
    "top": true,
    "image": "https://bfstatic.io/preview/3eed0db93300b1759e8dd2edfe5862ada1086eaf@1x.jpeg"
  },
  {
    "href": "/casino/games/merge-up-fury-by-bgaming",
    "name": "Merge Up Inu",
    "top": true,
    "image": "/images/slots/merge-up.8f2a9264.webp"
  },
  {
    "href": "/casino/games/clash-of-gods-anubis-vs-hades-by-bgaming",
    "name": "Clash of Gods: Power Duel",
    "top": true,
    "image": "https://bfstatic.io/preview/softswiss:ClashofGodsAnubisvsHades@1x.jpeg"
  },
  {
    "href": "/casino/games/wild-zombies-by-popiplay",
    "name": "Wild Zombies",
    "top": true,
    "image": "https://bfstatic.io/preview/popiplay:WildZombies@1x.jpeg"
  },
  {
    "href": "/casino/games/gates-of-betfury-super-scatter-by-pragmatic-play",
    "name": "Gates of InuSlots Super Scatter",
    "top": true,
    "image": "/images/slots/gates-of.65dc55ea.webp"
  },
  {
    "href": "/casino/games/alien-fruits-by-bgaming",
    "name": "Alien Fruits",
    "top": true,
    "image": "https://bfstatic.io/preview/softswiss:AlienFruits@1x.jpeg"
  },
  {
    "href": "/casino/games/burning-coins-100-by-endorphina",
    "name": "Burning Coins 100",
    "top": true,
    "image": "https://bfstatic.io/preview/57a2e0febaa97c654af8ad77cc613f5477ee8b89@1x.jpeg"
  },
  {
    "href": "/casino/games/betfury-bonanza-by-pragmatic-play",
    "name": "InuSlots Bonanza",
    "top": true,
    "image": "/images/slots/bonanza.06462751.webp"
  },
  {
    "href": "/casino/games/lady-wolf-moon-by-bgaming",
    "name": "Lady Wolf Moon",
    "top": true,
    "image": "https://bfstatic.io/preview/f9c3a1c079e058f17f1c3cca44de7bf5ec58ce1c@1x.jpeg"
  },
  {
    "href": "/casino/games/danludans-fortune-bass-by-belatra-games",
    "name": "DanLudan's Fortune Bass",
    "top": true,
    "image": "https://bfstatic.io/preview/3c0d3758341d4dcda55e4b679d17d612@1x.jpeg"
  },
  {
    "href": "/casino/games/baba-yaga-tales-by-spinomenal",
    "name": "Baba Yaga Tales",
    "top": true,
    "image": "https://bfstatic.io/preview/5c73d353c015054621eeb6e0c8e1dc7c20669f64@1x.jpeg"
  },
  {
    "href": "/casino/games/blazing-coins-hold-and-win-by-popiplay",
    "name": "Blazing Coins Hold and Win",
    "top": true,
    "image": "https://bfstatic.io/preview/popiplay:BlazingCoinsHoldandWin@1x.jpeg"
  },
  {
    "href": "/casino/games/beauty-and-the-beast-by-belatra-games",
    "name": "Beauty and the Beast",
    "top": false,
    "image": "https://bfstatic.io/preview/dad6d9f3d14f107d611197ee7c205c6b1df4ffee@1x.jpeg"
  },
  {
    "href": "/casino/games/big-bang-by-belatra-games",
    "name": "Big Bang",
    "top": false,
    "image": "https://bfstatic.io/preview/26d15bb3e79d4598840366a9ec745b42@1x.jpeg"
  },
  {
    "href": "/casino/games/dogmasons-megawoof-by-popiplay",
    "name": "Dogmasons MegaWOOF",
    "top": false,
    "image": "https://bfstatic.io/preview/popiplay:DogmasonsMegaWOOF@1x.jpeg"
  },
  {
    "href": "/casino/games/book-of-rampage-2-by-spinomenal",
    "name": "Book Of Rampage 2",
    "top": false,
    "image": "https://bfstatic.io/preview/014c08a781e04ebb8478b73f520301b0@1x.jpeg"
  },
  {
    "href": "/casino/games/slayers-inc-by-hacksaw-gaming",
    "name": "Slayers Inc",
    "top": false,
    "image": "https://bfstatic.io/preview/cdadca675c3146d5b4f329b9fe91d1c1@1x.jpeg"
  },
  {
    "href": "/casino/games/hell-hot-1000-by-endorphina",
    "name": "Hell Hot 1000",
    "top": false,
    "image": "https://bfstatic.io/preview/72537e9b1d6ff18a08fcc27c725b3c80275f0a3c@1x.jpeg"
  },
  {
    "href": "/casino/games/duel-at-dawn-by-hacksaw-gaming",
    "name": "Duel at Dawn",
    "top": false,
    "image": "https://bfstatic.io/preview/33cb9763ecef46ba857eab4e928a5b4f@1x.jpeg"
  }
];

export const recentWins: WinItem[] = [
  {
    "href": "/casino/games/keno",
    "image": "/images/originals/keno.65d0dd58.webp",
    "avatar": "/images/avatars/a1.fcb99573.webp",
    "user": "Respector",
    "balance": "₫94,303,728.00"
  },
  {
    "href": "/casino/games/coinflip",
    "image": "/images/originals/coinflip.9dc75854.webp",
    "avatar": "/images/avatars/a2.3e531a86.webp",
    "user": "Octobomb",
    "balance": "₫39,249,599.64"
  },
  {
    "href": "/casino/games/coinflip",
    "image": "/images/originals/coinflip.9dc75854.webp",
    "avatar": "/images/avatars/a2.3e531a86.webp",
    "user": "Octobomb",
    "balance": "₫52,779,452.39"
  },
  {
    "href": "/casino/games/coinflip",
    "image": "/images/originals/coinflip.9dc75854.webp",
    "avatar": "/images/avatars/a2.3e531a86.webp",
    "user": "Octobomb",
    "balance": "₫52,779,452.39"
  },
  {
    "href": "/casino/games/coinflip",
    "image": "/images/originals/coinflip.9dc75854.webp",
    "avatar": "/images/avatars/a2.3e531a86.webp",
    "user": "Octobomb",
    "balance": "₫52,779,452.39"
  },
  {
    "href": "/casino/games/coinflip",
    "image": "/images/originals/coinflip.9dc75854.webp",
    "avatar": "/images/avatars/a2.3e531a86.webp",
    "user": "Octobomb",
    "balance": "₫52,779,452.39"
  },
  {
    "href": "/casino/games/coinflip",
    "image": "/images/originals/coinflip.9dc75854.webp",
    "avatar": "/images/avatars/a2.3e531a86.webp",
    "user": "Octobomb",
    "balance": "₫52,779,452.39"
  },
  {
    "href": "/casino/games/coinflip",
    "image": "/images/originals/coinflip.9dc75854.webp",
    "avatar": "/images/avatars/a2.3e531a86.webp",
    "user": "Octobomb",
    "balance": "₫52,779,452.39"
  },
  {
    "href": "/casino/games/coinflip",
    "image": "/images/originals/coinflip.9dc75854.webp",
    "avatar": "/images/avatars/a2.3e531a86.webp",
    "user": "Octobomb",
    "balance": "₫52,779,452.39"
  },
  {
    "href": "/casino/games/coinflip",
    "image": "/images/originals/coinflip.9dc75854.webp",
    "avatar": "/images/avatars/a2.3e531a86.webp",
    "user": "Octobomb",
    "balance": "₫52,779,452.39"
  },
  {
    "href": "/casino/games/coinflip",
    "image": "/images/originals/coinflip.9dc75854.webp",
    "avatar": "/images/avatars/a2.3e531a86.webp",
    "user": "Octobomb",
    "balance": "₫52,779,452.39"
  },
  {
    "href": "/casino/games/coinflip",
    "image": "/images/originals/coinflip.9dc75854.webp",
    "avatar": "/images/avatars/a2.3e531a86.webp",
    "user": "Octobomb",
    "balance": "₫52,779,452.39"
  },
  {
    "href": "/casino/games/crazy-balls-by-evolution",
    "image": "/images/wins/crazy-balls.21c8d672.webp",
    "avatar": "/images/avatars/a3.0daaf24b.webp",
    "user": "Ala24",
    "balance": "₫155,133,465.26"
  },
  {
    "href": "/casino/games/clumsy-cowboys-by-backseat-gaming",
    "image": "/images/wins/clumsy-cowboys.a047eae2.webp",
    "avatar": "/images/avatars/a4.2be554e8.webp",
    "user": "User3764162",
    "balance": "₫72,218,856.60"
  },
  {
    "href": "/casino/games/crazy-time-by-evolution",
    "image": "/images/wins/crazy-time.b642e502.webp",
    "avatar": "/images/avatars/a5.b36abba1.webp",
    "user": "Zid",
    "balance": "₫41,635,200.00"
  },
  {
    "href": "/casino/games/crazy-time-by-evolution",
    "image": "/images/wins/crazy-time.b642e502.webp",
    "avatar": "/images/avatars/a5.b36abba1.webp",
    "user": "Zid",
    "balance": "₫80,668,200.00"
  },
  {
    "href": "/casino/games/crazy-time-by-evolution",
    "image": "/images/wins/crazy-time.b642e502.webp",
    "avatar": "/images/avatars/a5.b36abba1.webp",
    "user": "Zid",
    "balance": "₫27,323,100.00"
  },
  {
    "href": "/casino/games/fruit-party-by-pragmatic-play",
    "image": "/images/wins/fruit-party.cc8f6afa.webp",
    "avatar": "/images/avatars/a5.b36abba1.webp",
    "user": "Zid",
    "balance": "₫36,795,108.00"
  },
  {
    "href": "/casino/games/santas-great-gifts-by-pragmatic-play",
    "image": "/images/wins/santas-gifts.63e5e8c2.webp",
    "avatar": "/images/avatars/a6.42a34189.webp",
    "user": "Nephrofix",
    "balance": "₫82,313,764.33"
  },
  {
    "href": "/casino/games/gates-of-betfury-super-scatter-by-pragmatic-play",
    "image": "/images/slots/gates-of.65dc55ea.webp",
    "avatar": "/images/avatars/a6.42a34189.webp",
    "user": "Nephrofix",
    "balance": "₫77,090,126.29"
  },
  {
    "href": "/casino/games/gates-of-betfury-super-scatter-by-pragmatic-play",
    "image": "/images/slots/gates-of.65dc55ea.webp",
    "avatar": "/images/avatars/a6.42a34189.webp",
    "user": "Nephrofix",
    "balance": "₫50,942,612.88"
  },
  {
    "href": "/casino/games/gates-of-olympus-1000-by-pragmatic-play",
    "image": "/images/wins/gates-of-olympus.e8bdd2bc.webp",
    "avatar": "/images/avatars/a6.42a34189.webp",
    "user": "Nephrofix",
    "balance": "₫106,127,114.96"
  },
  {
    "href": "/casino/games/gates-of-olympus-1000-by-pragmatic-play",
    "image": "/images/wins/gates-of-olympus.e8bdd2bc.webp",
    "avatar": "/images/avatars/a6.42a34189.webp",
    "user": "Nephrofix",
    "balance": "₫268,840,787.89"
  },
  {
    "href": "/casino/games/ancient-paws-by-bullshark-games",
    "image": "/images/wins/ancient-paws.a2a43869.webp",
    "avatar": "/images/avatars/a6.42a34189.webp",
    "user": "Nephrofix",
    "balance": "₫47,403,627.88"
  }
];

export const currencyLogos: CurrencyLogo[] = [
  {
    "name": "tether",
    "src": "https://betfury.so/images/pages/main/logos/tether@1x.png"
  },
  {
    "name": "bitcoin",
    "src": "https://betfury.so/images/pages/main/logos/bitcoin@1x.png"
  },
  {
    "name": "binance",
    "src": "https://betfury.so/images/pages/main/logos/binance@1x.png"
  },
  {
    "name": "ethereum",
    "src": "https://betfury.so/images/pages/main/logos/ethereum@1x.png"
  },
  {
    "name": "tron",
    "src": "https://betfury.so/images/pages/main/logos/tron@1x.png"
  },
  {
    "name": "litecoin",
    "src": "https://betfury.so/images/pages/main/logos/litecoin@1x.png"
  },
  {
    "name": "biswap",
    "src": "https://betfury.so/images/pages/main/logos/biswap@1x.png"
  },
  {
    "name": "dogecoin",
    "src": "https://betfury.so/images/pages/main/logos/dogecoin@1x.png"
  },
  {
    "name": "ripple",
    "src": "https://betfury.so/images/pages/main/logos/ripple@1x.png"
  },
  {
    "name": "polygon",
    "src": "https://betfury.so/images/pages/main/logos/polygon@1x.png"
  }
];

// Locally generated replacements for the captured bfstatic.io banner, which
// featured the InuSlots raccoon. `base` is suffixed with @1x/@2x and a webp or
// png extension by Hero.tsx; regenerate with scripts/install-hero-banner.mjs.
export type HeroSlide = {
  base: string;
  alt: string;
  accent: string;
  title: string;
};

export const heroSlides: HeroSlide[] = [
  {
    "base": "/images/hero/slide-1.ea85d2e7",
    "alt": "InuSlots captain holding a gold VIP ticket",
    "accent": "JOIN FURY CRUISE:",
    "title": "ALL ABOARD FOR $100 000"
  },
  {
    "base": "/images/hero/slide-2.b30ec264",
    "alt": "InuSlots shiba behind a treasure chest of gold coins",
    "accent": "WELCOME BONUS:",
    "title": "UP TO $2 000 + 200 FREE SPINS"
  },
  {
    "base": "/images/hero/slide-3.c329c46d",
    "alt": "InuSlots shiba in a suit surrounded by crypto coins",
    "accent": "CRYPTO & EARN:",
    "title": "STAKE AT UP TO 60% APR"
  },
  {
    "base": "/images/hero/slide-4.c79903fa",
    "alt": "InuSlots shiba at a slot machine showing three sevens",
    "accent": "TOP SLOTS:",
    "title": "SPIN THE 777 JACKPOT"
  }
];

export const blockImages = [
  {
    "alt": "dice-red-stripes",
    "src": "https://betfury.so/images/pages/main/cards/dice-red-stripes.png"
  },
  {
    "alt": "ball-blue-stripes",
    "src": "https://betfury.so/images/pages/main/cards/ball-blue-stripes.png"
  }
];

export const topSports: SportItem[] = [
  {
    "href": "/sports/tennis-5",
    "icon": "tennis",
    "name": "Tennis",
    "hot": true
  },
  {
    "href": "/sports/baseball-3",
    "icon": "baseball",
    "name": "Baseball",
    "hot": true
  },
  {
    "href": "/sports/esoccer-300",
    "icon": "fifa",
    "name": "eSoccer",
    "hot": true
  },
  {
    "href": "/sports/soccer-1",
    "icon": "soccer",
    "name": "Soccer",
    "hot": true
  },
  {
    "href": "/sports/basketball-2",
    "icon": "basketball",
    "name": "Basketball",
    "hot": true
  },
  {
    "href": "/sports/ebasketball-302",
    "icon": "nba-2k",
    "name": "eBasketball",
    "hot": false
  },
  {
    "href": "/sports/dota-2-111",
    "icon": "dota-2",
    "name": "Dota 2",
    "hot": false
  },
  {
    "href": "/sports/counter-strike-109",
    "icon": "counter-strike",
    "name": "Counter-Strike",
    "hot": false
  },
  {
    "href": "/sports/league-of-legends-110",
    "icon": "league-of-legends",
    "name": "League of Legends",
    "hot": false
  },
  {
    "href": "/sports/ice-hockey-4",
    "icon": "ice-hockey",
    "name": "Ice Hockey",
    "hot": false
  },
  {
    "href": "/sports/cricket-21",
    "icon": "cricket",
    "name": "Cricket",
    "hot": false
  },
  {
    "href": "/sports/volleyball-23",
    "icon": "volleyball",
    "name": "Volleyball",
    "hot": false
  },
  {
    "href": "/sports/american-football-16",
    "icon": "american-football",
    "name": "American Football",
    "hot": false
  }
];

export type StakingPool = {
  href: string;
  icon: string;
  name: string;
  ticker: string;
  rateLabel: string;
  rate: string;
  duration: string;
  featured?: boolean;
};

// Every icon here is already in public/images/coins/, so this row has no
// external dependency. The house pool leads the row and is the only one on a
// flexible term — the rest are fixed 365-day pools.
export const stakingPools: StakingPool[] = [
  {
    "href": "/staking",
    "icon": "/images/coins/inus.97293ec5.png",
    "name": "INUS Staking",
    "ticker": "INUS",
    "rateLabel": "APY",
    "rate": "29.46%",
    "duration": "Flexible",
    "featured": true
  },
  {
    "href": "/crypto-staking/bnb",
    "icon": "/images/coins/bnb.svg",
    "name": "Binance Coin",
    "ticker": "BNB",
    "rateLabel": "Est.APR",
    "rate": "60%",
    "duration": "365 Days"
  },
  {
    "href": "/crypto-staking/btc",
    "icon": "/images/coins/btc.svg",
    "name": "Bitcoin",
    "ticker": "BTC",
    "rateLabel": "Est.APR",
    "rate": "60%",
    "duration": "365 Days"
  },
  {
    "href": "/crypto-staking/eth",
    "icon": "/images/coins/eth.svg",
    "name": "Ethereum",
    "ticker": "ETH",
    "rateLabel": "Est.APR",
    "rate": "60%",
    "duration": "365 Days"
  },
  {
    "href": "/crypto-staking/trx",
    "icon": "/images/coins/trx.svg",
    "name": "Tron",
    "ticker": "TRX",
    "rateLabel": "Est.APR",
    "rate": "60%",
    "duration": "365 Days"
  },
  {
    "href": "/crypto-staking/usdt",
    "icon": "/images/coins/usdt.svg",
    "name": "Tether",
    "ticker": "USDT",
    "rateLabel": "Est.APR",
    "rate": "60%",
    "duration": "365 Days"
  }
];
