"use client";

import type { CSSProperties } from "react";

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside className={`left-menu left-menu--visible left-menu${collapsed ? " left-menu--short" : ""}`} data-v-6f8a5598="" data-v-81f07ec6="">
      <div className="left-menu__outer" data-v-81f07ec6="">
        <div className="left-menu__inner" data-v-81f07ec6="">
          <a
            className="entry-point unlink"
            data-v-81f07ec6=""
            style={{
              "--v69f6d885": "radial-gradient(74.33% 117.05% at 50% 0%, #FE1B44 0%, #9C2A3F 58.5%, #2E0008 100%)",
              "--v43717212": "radial-gradient(110.34% 173.75% at 50% -61.25%, #FE1B44 0%, #9C2A3F 44.76%, #2E0008 100%)",
              "--v36069a4c": "radial-gradient(88.97% 137.51% at 50% 0%, #ED1D49 0%, #9C2A3F 58.5%, #2E0008 100%)",
              "--v0fe599c2": "radial-gradient(123.04% 193.75% at 50% -61.25%, #ED1D49 0%, #9C2A3F 44.76%, #2E0008 100%)",
              "--v3ab02ef3": "110px",
              "--v1b36e0ed": "1px 1px 0 #680002",
              "--v69287c23": "#FFACBB",
            } as CSSProperties}
            data-v-5c039226=""
          >
            <div className="inner-text" data-v-5c039226="">
              <p className="entry-point__text entry-point__text" data-v-5c039226="">
                Fury Cruise
              </p>
            </div>
          </a>
          <div className="wrap" style={{ "--page-height": "1305px", "--hover-list-top-offset": "132px" } as CSSProperties} data-v-81f07ec6="" data-v-56daf784="">
            <div className="tabs" data-v-56daf784="">
              <a href="/casino" className="unlink tabs__tab tabs__tab--casino" data-v-56daf784="">
                <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon tabs__tab-icon" data-v-56daf784="" data-v-36d2042d="" data-name="casino">
                  <svg data-v-36d2042d="" viewBox="0 0 16 17">
                    <use href="#icon-casino" data-v-36d2042d="" />
                  </svg>
                </span>
                <div className="tabs__tab-label" data-v-56daf784="">
                  Casino
                </div>
              </a>
              <a href="/sports" className="unlink tabs__tab tabs__tab--sport" data-v-56daf784="">
                <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon tabs__tab-icon" data-v-56daf784="" data-v-36d2042d="" data-name="sport">
                  <svg data-v-36d2042d="" viewBox="0 0 16 17">
                    <use href="#icon-sport" data-v-36d2042d="" />
                  </svg>
                </span>
                <div className="tabs__tab-label" data-v-56daf784="">
                  Sports
                </div>
              </a>
            </div>
          </div>
          <div className="navigation" data-v-81f07ec6="" data-v-1a2842e8="">
            <a href="/missions" className="navigation__item unlink" data-v-1a2842e8="">
              <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon navigation__item-icon" data-v-1a2842e8="" data-v-36d2042d="" data-name="missions-color">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use href="#icon-missions-color" data-v-36d2042d="" />
                </svg>
              </span>
              <div className="navigation__item-wrap" data-v-1a2842e8="">
                <span className="navigation__item-name" data-v-1a2842e8="">
                  Missions
                </span>
              </div>
              <div data-v-1a2842e8="" className="additional-info activeMissions">
                31
              </div>
            </a>
            <a href="/bonus-cabinet" className="navigation__item unlink" data-v-1a2842e8="">
              <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon navigation__item-icon" data-v-1a2842e8="" data-v-36d2042d="" data-name="bonus-cabinet">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use href="#icon-bonus-cabinet" data-v-36d2042d="" />
                </svg>
              </span>
              <div className="navigation__item-wrap" data-v-1a2842e8="">
                <span className="navigation__item-name" data-v-1a2842e8="">
                  Bonuses
                </span>
              </div>
            </a>
            <a href="/crypto-and-earn" className="navigation__item unlink" data-v-1a2842e8="">
              <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon navigation__item-icon" data-v-1a2842e8="" data-v-36d2042d="" data-name="bag-dollar">
                <svg data-v-36d2042d="" viewBox="0 0 20 20">
                  <use href="#icon-bag-dollar" data-v-36d2042d="" />
                </svg>
              </span>
              <div className="navigation__item-wrap" data-v-1a2842e8="">
                <span className="navigation__item-name" data-v-1a2842e8="">
                  Crypto &amp; Earn
                </span>
              </div>
              <span data-v-36d2042d="" data-v-1a2842e8="" className="icon navigation__item-icon navigation__item-icon--right" style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} data-name="chevron-right">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use data-v-36d2042d="" href="#icon-chevron-right" />
                </svg>
              </span>
            </a>
            <a href="/about-bfg" className="navigation__item unlink" data-v-1a2842e8="">
              <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon navigation__item-icon" data-v-1a2842e8="" data-v-36d2042d="" />
              <div className="navigation__item-wrap" data-v-1a2842e8="">
                <span className="navigation__item-name" data-v-1a2842e8="">
                  BFG Token
                </span>
              </div>
            </a>
            <a href="/promo" className="navigation__item unlink" data-v-1a2842e8="">
              <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon navigation__item-icon" data-v-1a2842e8="" data-v-36d2042d="" data-name="promotions">
                <svg data-v-36d2042d="" viewBox="0 0 19 20">
                  <use href="#icon-promotions" data-v-36d2042d="" />
                </svg>
              </span>
              <div className="navigation__item-wrap" data-v-1a2842e8="">
                <span className="navigation__item-name" data-v-1a2842e8="">
                  Promotions
                </span>
              </div>
            </a>
            <a href="/about-referral-system" className="navigation__item unlink" data-v-1a2842e8="">
              <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon navigation__item-icon" data-v-1a2842e8="" data-v-36d2042d="" data-name="referral-2">
                <svg data-v-36d2042d="" viewBox="0 0 19 20">
                  <use href="#icon-referral-2" data-v-36d2042d="" />
                </svg>
              </span>
              <div className="navigation__item-wrap" data-v-1a2842e8="">
                <span className="navigation__item-name" data-v-1a2842e8="">
                  Refer &amp; Earn
                </span>
              </div>
            </a>
            <a href="/vip-club" className="navigation__item unlink" data-v-1a2842e8="">
              <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon navigation__item-icon" data-v-1a2842e8="" data-v-36d2042d="" data-name="crown-2">
                <svg data-v-36d2042d="" viewBox="0 0 19 20">
                  <use href="#icon-crown-2" data-v-36d2042d="" />
                </svg>
              </span>
              <div className="navigation__item-wrap" data-v-1a2842e8="">
                <span className="navigation__item-name" data-v-1a2842e8="">
                  <span className="navigation__item-name--red" data-v-1a2842e8="">
                    VIP{" "}
                  </span>
                  Club
                </span>
              </div>
            </a>
            <a href="/rank-system" className="navigation__item unlink" data-v-1a2842e8="">
              <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon navigation__item-icon" data-v-1a2842e8="" data-v-36d2042d="" data-name="vip">
                <svg data-v-36d2042d="" viewBox="0 0 19 20">
                  <use href="#icon-vip" data-v-36d2042d="" />
                </svg>
              </span>
              <div className="navigation__item-wrap" data-v-1a2842e8="">
                <span className="navigation__item-name" data-v-1a2842e8="">
                  Rank System
                </span>
              </div>
            </a>
            <a href="/boxes/all" className="navigation__item unlink" data-v-1a2842e8="">
              <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon navigation__item-icon" data-v-1a2842e8="" data-v-36d2042d="" data-name="box">
                <svg data-v-36d2042d="" viewBox="0 0 19 20">
                  <use href="#icon-box" data-v-36d2042d="" />
                </svg>
              </span>
              <div className="navigation__item-wrap" data-v-1a2842e8="">
                <span className="navigation__item-name" data-v-1a2842e8="">
                  Free Crypto Boxes
                </span>
              </div>
            </a>
            <a href="/news" className="navigation__item unlink" data-v-1a2842e8="">
              <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon navigation__item-icon" data-v-1a2842e8="" data-v-36d2042d="" data-name="docs">
                <svg data-v-36d2042d="" viewBox="0 0 19 20">
                  <use href="#icon-docs" data-v-36d2042d="" />
                </svg>
              </span>
              <div className="navigation__item-wrap" data-v-1a2842e8="">
                <span className="navigation__item-name" data-v-1a2842e8="">
                  News
                </span>
              </div>
            </a>
            <a href="/" className="navigation__item unlink" data-v-1a2842e8="">
              <span style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon navigation__item-icon" data-v-1a2842e8="" data-v-36d2042d="" data-name="livechat">
                <svg data-v-36d2042d="" viewBox="0 0 24 23">
                  <use href="#icon-livechat" data-v-36d2042d="" />
                </svg>
              </span>
              <div className="navigation__item-wrap" data-v-1a2842e8="">
                <span className="navigation__item-name" data-v-1a2842e8="">
                  Live Support
                </span>
              </div>
            </a>
          </div>
          <div className="bottom-section" data-v-81f07ec6="" data-v-c65a3f36="">
            <div className="buy-crypto" data-v-c65a3f36="">
              <div className="buy-crypto__images" data-v-c65a3f36="">
                <img src="/images/pages/main/buycrypto/gpay.svg" alt="Google Pay" loading="lazy" className="buy-crypto__images-img" data-v-c65a3f36="" />
                <img src="/images/pages/main/buycrypto/applepay.svg" alt="Apple Pay" loading="lazy" className="buy-crypto__images-img" data-v-c65a3f36="" />
                <img src="/images/pages/main/buycrypto/mastercard.svg" alt="Mastercard" loading="lazy" className="buy-crypto__images-img" data-v-c65a3f36="" />
                <img src="/images/pages/main/buycrypto/visa.svg" alt="Visa" loading="lazy" className="buy-crypto__images-img" data-v-c65a3f36="" />
              </div>
              <button className="buy-crypto__button button-flat button-flat_sm button-flat_grey1 button-flat_center button-flat_fullwidth" type="button" data-v-c65a3f36="" data-v-194e452b="">
                <span className="button-flat__inner" data-v-194e452b="">
                  <span className="button-flat__text" data-v-194e452b="">
                    Buy Crypto
                  </span>
                </span>
              </button>
            </div>
            <div className="links" data-v-c65a3f36="">
              <a href="/install-app" className="links__item unlink" data-v-c65a3f36="">
                <span className="links__item-name" data-v-c65a3f36="">
                  Betfury App
                </span>
                <div className="links__item-images" style={{ gap: "4px" } as CSSProperties} data-v-c65a3f36="">
                  <span style={{ color: "white", "--fd873e1a": "14px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon links__item-image" data-v-c65a3f36="" data-v-36d2042d="" data-name="apple">
                    <svg data-v-36d2042d="" viewBox="0 0 24 24">
                      <use href="#icon-apple" data-v-36d2042d="" />
                    </svg>
                  </span>
                  <span style={{ color: "rgba(164, 198, 57, 1)", "--fd873e1a": "14px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon links__item-image" data-v-c65a3f36="" data-v-36d2042d="" data-name="android">
                    <svg data-v-36d2042d="" viewBox="0 0 24 24">
                      <use href="#icon-android" data-v-36d2042d="" />
                    </svg>
                  </span>
                  <span style={{ color: "rgba(0, 120, 214, 1)", "--fd873e1a": "14px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon links__item-image" data-v-c65a3f36="" data-v-36d2042d="" data-name="windows">
                    <svg data-v-36d2042d="" viewBox="0 0 24 24">
                      <use href="#icon-windows" data-v-36d2042d="" />
                    </svg>
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
