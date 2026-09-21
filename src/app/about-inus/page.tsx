import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import SiteFooter from "@/components/SiteFooter";
import { tokenStats, deflationStrategies, useCases, tokenAssets } from "@/data/token-data";

// The root layout's title template appends " | InuSlots", so this is the bare
// page name.
export const metadata: Metadata = {
  title: "INUS Token",
  description:
    "INUS is the native token of InuSlots, launching on Arc with a fixed 1B supply. Stake it for daily rewards, or use it across the casino and sportsbook.",
};

export default function AboutInusPage() {
  return (
    <AppShell>
      <main className="wrapper" data-v-6f8a5598="">
        <div className="wrapper__inner sp" data-v-6f8a5598="">
          <div className="container global-container" data-v-6f8a5598="">
            <div className="token-page">
              {/* The hero and the "how to get" block are both full-bleed scene
                  art with copy laid over the darker left side, matching the
                  reference page. */}
              <section
                className="token-banner token-banner--hero"
                style={{ backgroundImage: `url(${tokenAssets.heroBg})` }}
              >
                <div className="token-banner__copy">
                  <h1 className="token-banner__title">INUS TOKEN</h1>
                  <p className="token-banner__text">
                    INUS is the internal token of InuSlots launched on ARC. Use INUS for betting, trading, and earning by staking.
                  </p>
                  <div className="token-banner__actions">
                    <a href="/buy-crypto" className="token-btn token-btn--primary">
                      Buy INUS
                    </a>
                    <a href="/staking" className="token-btn token-btn--ghost">
                      INUS Staking
                    </a>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="token-banner__art" src={tokenAssets.heroCoins} alt="" width={900} height={726} />
              </section>

              <section className="token-strategy">
                <h2 className="token-section-title">Deflation strategy</h2>
                <div className="token-strategy__grid">
                  {deflationStrategies.map((item) => (
                    <a href={item.href} className="strategy-card" key={item.title}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="strategy-card__icon" src={item.icon} alt="" width={40} height={40} />
                      <div className="strategy-card__body">
                        <span className="strategy-card__title">{item.title}</span>
                        <span className="strategy-card__text">{item.text}</span>
                      </div>
                      <span className="strategy-card__arrow" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              </section>

              <section className="token-stats">
                <header className="token-stats__header">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="token-stats__coin" src={tokenAssets.coin} alt="" width={48} height={48} />
                  <div className="token-stats__ident">
                    <span className="token-stats__ticker">INUS</span>
                    <span className="token-stats__price">Price {tokenStats.price}</span>
                  </div>
                  <a href={tokenStats.contractUrl} className="token-link" target="_blank" rel="noreferrer">
                    View Contract ↗
                  </a>
                </header>

                <div className="token-stats__panel">
                  <div className="token-stats__col">
                    <h3 className="token-stats__heading">Tokenomics</h3>
                    <dl className="token-facts">
                      {tokenStats.tokenomics.map((row) => (
                        <div className="token-facts__row" key={row.label}>
                          <dt>{row.label}</dt>
                          <dd className={row.highlight ? "token-facts__value token-facts__value--link" : "token-facts__value"}>
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Fills the space the removed Treasury/Burn column left
                      behind, so the panel is not a list against a void. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="token-stats__art" src={tokenAssets.tokenomics} alt="" width={760} height={569} />
                </div>
              </section>

              <section className="token-usecases">
                <h2 className="token-section-title">How to use INUS?</h2>
                <div className="token-usecases__grid">
                  {useCases.map((item) => (
                    <div className="usecase" key={item.title}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="usecase__icon" src={item.icon} alt="" width={48} height={48} />
                      <h3 className="usecase__title">
                        {item.title}
                        {item.badge && <span className="usecase__badge">{item.badge}</span>}
                      </h3>
                      <p className="usecase__text">{item.text}</p>
                      <div className="usecase__links">
                        {item.links.map((link) => (
                          <a href={link.href} className="token-link" key={link.label}>
                            {link.label} ›
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="token-banner token-banner--get"
                style={{ backgroundImage: `url(${tokenAssets.getArt})` }}
              >
                <div className="token-banner__copy">
                  <h2 className="token-banner__title token-banner__title--sm">How to get INUS?</h2>
                  <p className="token-banner__text">
                    Get INUS directly on InuSlots using Crypto Swap or trade it on our partner&apos;s on-chain exchanges
                  </p>
                  <div className="token-banner__actions">
                    <a href="/buy-crypto" className="token-btn token-btn--primary">
                      Buy INUS
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        <SiteFooter />
      </main>
    </AppShell>
  );
}
