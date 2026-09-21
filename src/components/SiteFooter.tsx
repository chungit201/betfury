"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

export default function SiteFooter() {
  /**
   * Below 1020px the captured stylesheet hides every submenu list and shows a
   * chevron, expecting an `opened` class to bring the list back — but whatever
   * toggled that class lived in a Vue chunk that was never captured, so the
   * footer menus simply could not be opened on a phone.
   *
   * Keyed by heading rather than index because the markup is six hardcoded
   * blocks, not a list, and a heading survives reordering.
   */
  const [openMenus, setOpenMenus] = useState<ReadonlySet<string>>(new Set());

  const submenuProps = (title: string) => {
    const isOpen = openMenus.has(title);
    return {
      className: `submenu${isOpen ? " opened" : ""}`,
      onClick: () =>
        setOpenMenus((open) => {
          const next = new Set(open);
          if (isOpen) next.delete(title);
          else next.add(title);
          return next;
        }),
      role: "button" as const,
      tabIndex: 0,
      "aria-expanded": isOpen,
    };
  };

  return (
    <footer className="footer" data-v-6f8a5598="" data-v-896dd4b3="">
      <div className="container" data-v-896dd4b3="">
        <div className="footer__inner" data-v-896dd4b3="">
          <div className="footer__menus" data-v-896dd4b3="">
            <div {...submenuProps("I-gaming")} data-v-896dd4b3="">
              <p data-v-896dd4b3="">
                {"I-gaming"}
              </p>
              <span style={{"--fd873e1a": "12px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon icon-arrow" data-v-896dd4b3="" data-v-36d2042d="" data-name="chevron-down">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use href="#icon-chevron-down" data-v-36d2042d="" />
                </svg>
              </span>
              <ul data-v-896dd4b3="">
                <li data-v-896dd4b3="">
                  <a href="/casino" className="" data-v-896dd4b3="">
                    {"All games"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/casino/games/dice" className="" data-v-896dd4b3="">
                    {"Dice"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/casino/slots" className="" data-v-896dd4b3="">
                    {"Slots"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/rank-system" className="" data-v-896dd4b3="">
                    {"Rank system"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/casino/live-casino" className="" data-v-896dd4b3="">
                    {"Live casino"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/casino/games/plinko" className="" data-v-896dd4b3="">
                    {"Plinko"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/casino/poker" className="" data-v-896dd4b3="">
                    {"Crypto Poker"}
                  </a>
                </li>
              </ul>
            </div>
            <div {...submenuProps("Features")} data-v-896dd4b3="">
              <p data-v-896dd4b3="">
                {"Features"}
              </p>
              <span style={{"--fd873e1a": "12px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon icon-arrow" data-v-896dd4b3="" data-v-36d2042d="" data-name="chevron-down">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use href="#icon-chevron-down" data-v-36d2042d="" />
                </svg>
              </span>
              <ul data-v-896dd4b3="">
                <li data-v-896dd4b3="">
                  <a href="/staking" className="" data-v-896dd4b3="">
                    {"BFG Staking"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/crypto-staking" className="" data-v-896dd4b3="">
                    {"Crypto Staking"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/boxes/all" className="" data-v-896dd4b3="">
                    {"InuSlots Box"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/daily-tasks" className="" data-v-896dd4b3="">
                    {"Daily tasks"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a target="_blank" rel="noopener noreferrer" href="https://betfury-affiliate.com/" className="submenu-link" data-v-896dd4b3="">
                    <span data-v-896dd4b3="">
                      <span className="submenu-link__text" data-v-896dd4b3="">
                        {"Affiliate Program"}
                      </span>
                      <span style={{"--fd873e1a": "16px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon" data-v-896dd4b3="" data-v-36d2042d="" data-name="link">
                        <svg data-v-36d2042d="" viewBox="0 0 24 24">
                          <use href="#icon-link" data-v-36d2042d="" />
                        </svg>
                      </span>
                    </span>
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/futures" className="" data-v-896dd4b3="">
                    {"Futures"}
                  </a>
                </li>
              </ul>
            </div>
            <div {...submenuProps("Promo")} data-v-896dd4b3="">
              <p data-v-896dd4b3="">
                {"Promo"}
              </p>
              <span style={{"--fd873e1a": "12px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon icon-arrow" data-v-896dd4b3="" data-v-36d2042d="" data-name="chevron-down">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use href="#icon-chevron-down" data-v-36d2042d="" />
                </svg>
              </span>
              <ul data-v-896dd4b3="">
                <li data-v-896dd4b3="">
                  <a href="/promo" className="" data-v-896dd4b3="">
                    {"Promotions"}
                  </a>
                </li>
              </ul>
            </div>
            <div {...submenuProps("About us")} data-v-896dd4b3="">
              <p data-v-896dd4b3="">
                {"About us"}
              </p>
              <span style={{"--fd873e1a": "12px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon icon-arrow" data-v-896dd4b3="" data-v-36d2042d="" data-name="chevron-down">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use href="#icon-chevron-down" data-v-36d2042d="" />
                </svg>
              </span>
              <ul data-v-896dd4b3="">
                <li data-v-896dd4b3="">
                  <a href="/news" className="" data-v-896dd4b3="">
                    {"News"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/about-bfg" className="" data-v-896dd4b3="">
                    {"About BFG"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/about-team" className="" data-v-896dd4b3="">
                    {"About team"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a target="_blank" rel="noopener noreferrer nofollow" href="https://docs.betfury.com/white-paper" className="submenu-link" data-v-896dd4b3="">
                    <span data-v-896dd4b3="">
                      <span className="submenu-link__text" data-v-896dd4b3="">
                        {"InuSlots Whitepaper"}
                      </span>
                      <span style={{"--fd873e1a": "16px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon" data-v-896dd4b3="" data-v-36d2042d="" data-name="link">
                        <svg data-v-36d2042d="" viewBox="0 0 24 24">
                          <use href="#icon-link" data-v-36d2042d="" />
                        </svg>
                      </span>
                    </span>
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a target="_blank" rel="noopener noreferrer nofollow" href="https://docs.betfury.com/betfury/" className="submenu-link" data-v-896dd4b3="">
                    <span data-v-896dd4b3="">
                      <span className="submenu-link__text" data-v-896dd4b3="">
                        {"InuSlots Docs"}
                      </span>
                      <span style={{"--fd873e1a": "16px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon" data-v-896dd4b3="" data-v-36d2042d="" data-name="link">
                        <svg data-v-36d2042d="" viewBox="0 0 24 24">
                          <use href="#icon-link" data-v-36d2042d="" />
                        </svg>
                      </span>
                    </span>
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a target="_blank" rel="noopener noreferrer" href="https://betfury-mirrors.io/" className="submenu-link" data-v-896dd4b3="">
                    <span data-v-896dd4b3="">
                      <span className="submenu-link__text" data-v-896dd4b3="">
                        {"Official Mirrors"}
                      </span>
                      <span style={{"--fd873e1a": "16px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon" data-v-896dd4b3="" data-v-36d2042d="" data-name="link">
                        <svg data-v-36d2042d="" viewBox="0 0 24 24">
                          <use href="#icon-link" data-v-36d2042d="" />
                        </svg>
                      </span>
                    </span>
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/install-app" className="" data-v-896dd4b3="">
                    {"Download application"}
                  </a>
                </li>
              </ul>
            </div>
            <div {...submenuProps("Contact us")} data-v-896dd4b3="">
              <p data-v-896dd4b3="">
                {"Contact us"}
              </p>
              <span style={{"--fd873e1a": "12px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon icon-arrow" data-v-896dd4b3="" data-v-36d2042d="" data-name="chevron-down">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use href="#icon-chevron-down" data-v-36d2042d="" />
                </svg>
              </span>
              <ul data-v-896dd4b3="">
                <li data-v-896dd4b3="">
                  <span data-v-896dd4b3="">
                    <button data-v-896dd4b3="">
                      {"Live Support"}
                    </button>
                    <br data-v-896dd4b3="" />
                    <span data-v-896dd4b3="">
                      {"For quick help with any question"}
                    </span>
                  </span>
                </li>
                <li data-v-896dd4b3="">
                  <span data-v-896dd4b3="">
                    <a href="mailto:support@inuslots.com" className="submenu-link" data-v-896dd4b3="">
                      {"support@inuslots.com"}
                    </a>
                    <br data-v-896dd4b3="" />
                    <span data-v-896dd4b3="">
                      {"For questions and technical issues"}
                    </span>
                  </span>
                </li>
                <li data-v-896dd4b3="">
                  <span data-v-896dd4b3="">
                    <a href="mailto:bugbounty@betfury.com" className="submenu-link" data-v-896dd4b3="">
                      {"bugbounty@betfury.com"}
                    </a>
                    <br data-v-896dd4b3="" />
                    <span data-v-896dd4b3="">
                      {"For bugbounty reports"}
                    </span>
                  </span>
                </li>
                <li data-v-896dd4b3="">
                  <span data-v-896dd4b3="">
                    <a href="mailto:pr@inuslots.com" className="submenu-link" data-v-896dd4b3="">
                      {"pr@inuslots.com"}
                    </a>
                    <br data-v-896dd4b3="" />
                    <span data-v-896dd4b3="">
                      {"For marketing and partnership proposals"}
                    </span>
                  </span>
                </li>
                <li data-v-896dd4b3="">
                  <span data-v-896dd4b3="">
                    <a href="mailto:affiliate@inuslots.com" className="submenu-link" data-v-896dd4b3="">
                      {"affiliate@inuslots.com"}
                    </a>
                    <br data-v-896dd4b3="" />
                    <span data-v-896dd4b3="">
                      {"To become InuSlots affiliate partner"}
                    </span>
                  </span>
                </li>
              </ul>
            </div>
            <div {...submenuProps("Help")} data-v-896dd4b3="">
              <p data-v-896dd4b3="">
                {"Help"}
              </p>
              <span style={{"--fd873e1a": "12px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon icon-arrow" data-v-896dd4b3="" data-v-36d2042d="" data-name="chevron-down">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use href="#icon-chevron-down" data-v-36d2042d="" />
                </svg>
              </span>
              <ul data-v-896dd4b3="">
                <li data-v-896dd4b3="">
                  <a href="/fairness" className="" data-v-896dd4b3="">
                    {"Fairness"}
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a target="_blank" rel="noopener noreferrer" href="https://docs.betfury.com/betfury/terms-of-services/privacy-policy" className="submenu-link" data-v-896dd4b3="">
                    <span data-v-896dd4b3="">
                      <span className="submenu-link__text" data-v-896dd4b3="">
                        {"Privacy Policy"}
                      </span>
                      <span style={{"--fd873e1a": "16px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon" data-v-896dd4b3="" data-v-36d2042d="" data-name="link">
                        <svg data-v-36d2042d="" viewBox="0 0 24 24">
                          <use href="#icon-link" data-v-36d2042d="" />
                        </svg>
                      </span>
                    </span>
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a target="_blank" rel="noopener noreferrer" href="https://docs.betfury.com/betfury/terms-of-services/terms-and-conditions" className="submenu-link" data-v-896dd4b3="">
                    <span data-v-896dd4b3="">
                      <span className="submenu-link__text" data-v-896dd4b3="">
                        {"Terms of Service"}
                      </span>
                      <span style={{"--fd873e1a": "16px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon" data-v-896dd4b3="" data-v-36d2042d="" data-name="link">
                        <svg data-v-36d2042d="" viewBox="0 0 24 24">
                          <use href="#icon-link" data-v-36d2042d="" />
                        </svg>
                      </span>
                    </span>
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a target="_blank" rel="noopener noreferrer" href="https://docs.betfury.com/betfury/terms-of-services/sports-betting-terms-and-conditions" className="submenu-link" data-v-896dd4b3="">
                    <span data-v-896dd4b3="">
                      <span className="submenu-link__text" data-v-896dd4b3="">
                        {"Sportsbetting T&C"}
                      </span>
                      <span style={{"--fd873e1a": "16px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon" data-v-896dd4b3="" data-v-36d2042d="" data-name="link">
                        <svg data-v-36d2042d="" viewBox="0 0 24 24">
                          <use href="#icon-link" data-v-36d2042d="" />
                        </svg>
                      </span>
                    </span>
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a target="_blank" rel="noopener noreferrer" href="https://docs.betfury.com/betfury/betfury-bug-bounty-program" className="submenu-link" data-v-896dd4b3="">
                    <span data-v-896dd4b3="">
                      <span className="submenu-link__text" data-v-896dd4b3="">
                        {"Bug Bounty Program"}
                      </span>
                      <span style={{"--fd873e1a": "16px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon" data-v-896dd4b3="" data-v-36d2042d="" data-name="link">
                        <svg data-v-36d2042d="" viewBox="0 0 24 24">
                          <use href="#icon-link" data-v-36d2042d="" />
                        </svg>
                      </span>
                    </span>
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a target="_blank" rel="noopener noreferrer" href="https://forms.gle/qfVfRxqAJ2KX66BWA" className="submenu-link" data-v-896dd4b3="">
                    <span data-v-896dd4b3="">
                      <span className="submenu-link__text" data-v-896dd4b3="">
                        {"Business Inquiries"}
                      </span>
                      <span style={{"--fd873e1a": "16px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon" data-v-896dd4b3="" data-v-36d2042d="" data-name="link">
                        <svg data-v-36d2042d="" viewBox="0 0 24 24">
                          <use href="#icon-link" data-v-36d2042d="" />
                        </svg>
                      </span>
                    </span>
                  </a>
                </li>
                <li data-v-896dd4b3="">
                  <a href="/responsible-gambling" className="" data-v-896dd4b3="">
                    {"Responsible Gambling"}
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-info" data-v-896dd4b3="">
              <div className="footer-info__icons" data-v-896dd4b3="">
                <i data-v-896dd4b3="">
                  {"18+"}
                </i>
                <a className="siq" href="https://bfstatic.io/siq.pdf" target="_blank" data-v-896dd4b3="">
                  {/* The captured stylesheet pins this slot to 61x28, the aspect
                      of the old horizontal wordmark. The token coin is square,
                      so an inline width overrides that rule (it carries no
                      !important) rather than being stretched to fit. */}
                  <img src="/images/coins/inus.97293ec5.png" width="28" loading="lazy" height="28" alt="INUS" data-v-896dd4b3="" style={{ width: 28 } as CSSProperties} />
                </a>
              </div>
              <div className="footer-info__wrap" data-v-896dd4b3="">
                <p data-v-896dd4b3="">
                  {"This website offers gaming with risk experience. To be a user of our site you must be over 18 years old. We are not responsible for the violation of your local laws related to i-gaming. Play responsibly and have fun on InuSlots."}
                </p>
                <p data-v-896dd4b3="">
                  {"InuSlots is a brand name of Universe B Games N.V. Company Address: Dr. H. Fergusonweg 1, Curacao. InuSlots is authorised to operate by the Curaçao Gaming Control Board under its valid Certificate of Operation until the process of the application (OGL/2024/1494/0942) has concluded."}
                </p>
              </div>
              <button className="add_token_metamask metamask_mob" data-v-896dd4b3="" data-v-f574dc99="">
                <img src="/images/coins/inus.97293ec5.png" alt="INUS" loading="lazy" data-v-f574dc99="" />
                <span className="text" data-v-f574dc99="">
                  {"INUS"}
                </span>
                <span style={{"--fd873e1a": "10px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon arrow" data-v-f574dc99="" data-v-36d2042d="" data-name="chevron-right">
                  <svg data-v-36d2042d="" viewBox="0 0 24 24">
                    <use href="#icon-chevron-right" data-v-36d2042d="" />
                  </svg>
                </span>
                <span style={{"--fd873e1a": "1em", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon" data-v-f574dc99="" data-v-36d2042d="" data-name="metamask">
                  <svg data-v-36d2042d="">
                    <use href="#icon-metamask" data-v-36d2042d="" />
                  </svg>
                </span>
                <span className="text" data-v-f574dc99="">
                  {"Metamask"}
                </span>
              </button>
            </div>
          </div>
          <div className="embla footer-logos-wrapper" data-v-896dd4b3="" data-v-bbf3c183="">
            <div className="embla__viewport" data-v-bbf3c183="">
              <div className="embla__container" data-v-bbf3c183="">
                <div className="embla__slide" data-v-bbf3c183="">
                  <div className="logotype-wrapper" data-v-bbf3c183="" data-v-68c6840b="" />
                </div>
                <div className="embla__slide" data-v-bbf3c183="">
                  <div className="logotype-wrapper" data-v-bbf3c183="" data-v-68c6840b="" />
                </div>
                <div className="embla__slide" data-v-bbf3c183="">
                  <div className="logotype-wrapper" data-v-bbf3c183="" data-v-68c6840b="" />
                </div>
                <div className="embla__slide" data-v-bbf3c183="">
                  <div className="logotype-wrapper" data-v-bbf3c183="" data-v-68c6840b="" />
                </div>
                <div className="embla__slide" data-v-bbf3c183="">
                  <a className="logotype-wrapper" href="https://cryptorank.io/price/bfg-token" target="_blank" rel="noopener noreferrer nofollow" data-v-bbf3c183="" data-v-68c6840b="" />
                </div>
                <div className="embla__slide" data-v-bbf3c183="">
                  <a className="logotype-wrapper" href="https://www.coingecko.com/en/coins/bfg-token" target="_blank" rel="noopener noreferrer nofollow" data-v-bbf3c183="" data-v-68c6840b="" />
                </div>
                <div className="embla__slide" data-v-bbf3c183="">
                  <a className="logotype-wrapper" href="https://coinmarketcap.com/currencies/betfury/" target="_blank" rel="noopener noreferrer nofollow" data-v-bbf3c183="" data-v-68c6840b="" />
                </div>
                <div className="embla__slide" data-v-bbf3c183="">
                  <a className="logotype-wrapper" href="https://dappradar.com/dapp/betfury" target="_blank" rel="noopener noreferrer nofollow" data-v-bbf3c183="" data-v-68c6840b="" />
                </div>
                <div className="embla__slide" data-v-bbf3c183="">
                  <a className="logotype-wrapper" href="https://coinbrain.com/coins/bnb-0xbb46693ebbea1ac2070e59b4d043b47e2e095f86" target="_blank" rel="noopener noreferrer nofollow" data-v-bbf3c183="" data-v-68c6840b="" />
                </div>
              </div>
            </div>
          </div>
          <section className="social" data-v-896dd4b3="">
            {/* Only the three channels that exist. The captured footer listed
                nine, every one pointing at a BetFury account and rendering as
                an empty coloured square because its glyph was never in the
                sprite. */}
            <div className="social-icons social-icons-wrapper" data-v-896dd4b3="" data-v-b4a8b5cd="">
              {[
                { name: "Telegram", href: "https://t.me/inuslots", icon: "telegram", bg: "linear-gradient(135deg, #18C8FF 0%, #0080DC 100%)" },
                { name: "X", href: "https://x.com/inuslots", icon: "x", bg: "linear-gradient(135deg, #3A3A3A 0%, #000 100%)" },
                { name: "Discord", href: "https://discord.gg/inuslots", icon: "discord", bg: "linear-gradient(135deg, #5662F6 0%, #3D2A8A 100%)" },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  style={{ "--bg": s.bg, "--width": "32px" } as CSSProperties}
                  className="social-icons__icon--background social-icons__icon--scale social-icons__icon--show-tip social-icons__icon"
                  data-v-b4a8b5cd=""
                >
                  <div className="social-icons__tooltip" data-v-b4a8b5cd="">
                    {s.name}
                  </div>
                  <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon social-icons__svg" data-v-b4a8b5cd="" data-v-36d2042d="" data-name={s.icon}>
                    <svg data-v-36d2042d="" viewBox="0 0 24 24">
                      <use href={`#icon-${s.icon}`} data-v-36d2042d="" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
            <button className="add_token_metamask metamask_desk" data-v-896dd4b3="" data-v-f574dc99="">
              <img src="/images/coins/inus.97293ec5.png" alt="INUS" loading="lazy" data-v-f574dc99="" />
              <span className="text" data-v-f574dc99="">
                {"INUS"}
              </span>
              <span style={{"--fd873e1a": "10px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon arrow" data-v-f574dc99="" data-v-36d2042d="" data-name="chevron-right">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use href="#icon-chevron-right" data-v-36d2042d="" />
                </svg>
              </span>
              <span style={{"--fd873e1a": "1em", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} className="icon" data-v-f574dc99="" data-v-36d2042d="" data-name="metamask">
                <svg data-v-36d2042d="">
                  <use href="#icon-metamask" data-v-36d2042d="" />
                </svg>
              </span>
              <span className="text" data-v-f574dc99="">
                {"Metamask"}
              </span>
            </button>
            <div className="currency-rate" data-v-896dd4b3="" data-v-7de9d674="">
              <span className="form__currency" style={{ display: "inline-flex", width: 20, height: 20, alignItems: "center", justifyContent: "center", fontSize: 14 }}>₫</span>
              <span data-v-7de9d674="">
                {"1 ₫ = "}
                <span data-v-9ea0d0c4="" data-v-7de9d674="" className="balance">
                  {"$0.00"}
                </span>
              </span>
              <div data-v-1e2757a8="" data-v-7de9d674="" className="tooltip currency-rate__tooltip tooltip">
                <div data-v-1e2757a8="" className="icon">
                  <span data-v-36d2042d="" data-v-7de9d674="" className="icon" style={{"--fd873e1a": "18px", "--fefcc86a": "none", "--v28dfdb28": "contain"} as CSSProperties} data-name="info-colors-2">
                    <svg data-v-36d2042d="">
                      <use data-v-36d2042d="" href="#icon-info-colors-2" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            <p className="copyright" data-v-896dd4b3="">
              {"Copyright © 2019-2026 InuSlots. All rights reserved."}
            </p>
          </section>
        </div>
      </div>
    </footer>
  );
}
