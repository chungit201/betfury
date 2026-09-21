"use client";

import type { CSSProperties } from "react";
import { heroImage } from "@/data/games-data";

export default function Hero() {
  return (
    <div className="home" data-v-7a7ce604="" data-v-f8b4a365="" style={{ touchAction: "pan-y" } as CSSProperties}>
      <div data-v-9cf2dd38="" data-v-f8b4a365="" className="dots dots--desktop home__dots" style={{ "--v6d62f876": "10s" } as CSSProperties}>
        <div data-v-9cf2dd38="" className="dots__wrap">
          <span data-v-36d2042d="" data-v-9cf2dd38="" className="icon dots__arrow" data-name="chevron-left" style={{ "--fd873e1a": "16px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties}>
            <svg data-v-36d2042d="" viewBox="0 0 24 24">
              <use data-v-36d2042d="" href="#icon-chevron-left" />
            </svg>
          </span>
        </div>
        <div data-v-9cf2dd38="" className="dot">
          <div data-v-9cf2dd38="" className="dot__progress" />
        </div>
        <div data-v-9cf2dd38="" className="dot dot--active">
          <div data-v-9cf2dd38="" className="dot__progress" style={{ animationPlayState: "running" } as CSSProperties} />
        </div>
        <div data-v-9cf2dd38="" className="dots__wrap">
          <span data-v-36d2042d="" data-v-9cf2dd38="" className="icon dots__arrow" data-name="chevron-right" style={{ "--fd873e1a": "16px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties}>
            <svg data-v-36d2042d="" viewBox="0 0 24 24">
              <use data-v-36d2042d="" href="#icon-chevron-right" />
            </svg>
          </span>
        </div>
      </div>
      <div className="wrapper home__image" data-v-f8b4a365="" data-v-3f8c07de="" style={{ position: "relative" } as CSSProperties}>
        <picture data-v-3f8c07de="">
          <source
            data-v-3f8c07de=""
            srcSet={`https://bfstatic.io/splitPageBannerImages/${heroImage.id}@1x.avif 1x, https://bfstatic.io/splitPageBannerImages/${heroImage.id}@2x.avif 2x`}
            type="image/avif"
          />
          <source
            data-v-3f8c07de=""
            srcSet={`https://bfstatic.io/splitPageBannerImages/${heroImage.id}@1x.webp 1x, https://bfstatic.io/splitPageBannerImages/${heroImage.id}@2x.webp 2x`}
            type="image/webp"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-v-3f8c07de=""
            src={`https://bfstatic.io/splitPageBannerImages/${heroImage.id}@1x.jpeg`}
            alt={heroImage.alt}
            className="banner-picture"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } as CSSProperties}
          />
        </picture>
      </div>
      <div data-v-f8b4a365="" className="home__text home__text--wrap-span">
        <div data-v-f8b4a365="" className="top-text" />
        <div data-v-f8b4a365="" className="title-text">
          <p>
            <span style={{ color: "#ed1d49" } as CSSProperties}>JOIN FURY CRUISE:</span>
            <br />
            ALL ABOARD FOR $100 000
          </p>
        </div>
      </div>
      <div className="home__wrap" data-v-f8b4a365="">
        <button className="home__btn button-3d button-3d_md button-3d_red button-3d_center" type="button" data-v-f8b4a365="" data-v-c8c96dbe="">
          <span className="button-3d__outer" data-v-c8c96dbe="">
            <span className="button-3d__inner" data-v-c8c96dbe="">
              <span className="button-3d__text" data-v-c8c96dbe="">
                Sign in & Join
              </span>
            </span>
          </span>
        </button>
        <div data-v-b513dc12="" data-v-1fba21b2="" data-v-f8b4a365="" className="login-variants home__login-variants">
          {[
            { id: "gmail", label: "Gmail", icon: "google-white" },
            { id: "metamask", label: "MetaMask", icon: "metamask-white" },
            { id: "telegram", label: "Telegram", icon: "telegram-white" },
            { id: "ton-connect", label: "Ton Connect", icon: "ton-wallet-white" },
            { id: "trust-wallet", label: "TrustWallet", icon: "trust-wallet-white" },
          ].map((v) => (
            <div data-v-b513dc12="" className="login-variant" key={v.id}>
              <div data-v-b513dc12="" className={`login-variant__tooltip login-variant__tooltip--${v.id}`}>
                {v.label}
              </div>
              <button data-v-194e452b="" data-v-b513dc12="" className="login-variant__btn button-flat button-flat_md button-flat_grey1 button-flat_center" type="button">
                <span data-v-194e452b="" className="button-flat__inner">
                  <span data-v-194e452b="" className="button-flat__text">
                    <span data-v-36d2042d="" data-v-b513dc12="" className="icon" data-name={v.icon} style={{ "--fd873e1a": "24px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties}>
                      <svg data-v-36d2042d="" viewBox="0 0 24 25">
                        <use data-v-36d2042d="" href={`#icon-${v.icon}`} />
                      </svg>
                    </span>
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
