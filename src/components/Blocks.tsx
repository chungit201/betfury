"use client";

import type { CSSProperties } from "react";
import { blockImages } from "@/data/games-data";

export default function Blocks() {
  return (
    <section aria-labelledby="platform-offers" className="blocks" data-v-7a7ce604="" data-v-32052700="">
      <a href="/casino" className="block block--casino" data-v-32052700="">
        <article className="block__inner" data-v-32052700="">
          <div className="block__data" data-v-32052700="">
            <h2 className="block__title" data-v-32052700="">
              <span className="heading" data-v-32052700="">
                Casino
              </span>
              <span className="divider" data-v-32052700="" />
              <button className="link link_md link_transparent block__link block__title-link" data-v-32052700="" data-v-a7ac1909="">
                <span className="link__body" data-v-a7ac1909="" />
                <span style={{ "--fd873e1a": "1em", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon link__icon" data-v-a7ac1909="" data-v-36d2042d="" data-name="chevron-right">
                  <svg data-v-36d2042d="" viewBox="0 0 24 24">
                    <use href="#icon-chevron-right" data-v-36d2042d="" />
                  </svg>
                </span>
              </button>
            </h2>
            <div className="block__text" data-v-32052700="">
              Enjoy BetFury Originals and other casino games from top providers.
            </div>
          </div>
          <div className="block__image" data-v-32052700="">
            <picture data-v-32052700="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={blockImages[0].alt} src={blockImages[0].src} width="108" height="104" data-v-32052700="" />
            </picture>
          </div>
        </article>
      </a>
      <a href="/sports" className="block block--sports" data-v-32052700="">
        <article className="block__inner" data-v-32052700="">
          <div className="block__data" data-v-32052700="">
            <h2 className="block__title" data-v-32052700="">
              <span className="heading" data-v-32052700="">
                Sport
              </span>
              <span className="divider" data-v-32052700="" />
              <button className="link link_md link_transparent block__link block__title-link" data-v-32052700="" data-v-a7ac1909="">
                <span className="link__body" data-v-a7ac1909="" />
                <span style={{ "--fd873e1a": "1em", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon link__icon" data-v-a7ac1909="" data-v-36d2042d="" data-name="chevron-right">
                  <svg data-v-36d2042d="" viewBox="0 0 24 24">
                    <use href="#icon-chevron-right" data-v-36d2042d="" />
                  </svg>
                </span>
              </button>
            </h2>
            <div className="block__text" data-v-32052700="">
              Bet on popular sports events with high odds and other great features.
            </div>
          </div>
          <div className="block__image" data-v-32052700="">
            <picture data-v-32052700="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={blockImages[1].alt} src={blockImages[1].src} width="108" height="104" data-v-32052700="" />
            </picture>
          </div>
        </article>
      </a>
      <a href="/crypto-and-earn" className="block block--earn" data-v-32052700="">
        <span style={{ "--fd873e1a": "40px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon block__icon" data-v-32052700="" data-v-36d2042d="" />
        <article className="block__inner" data-v-32052700="">
          <div className="block__data" data-v-32052700="">
            <h2 className="block__title" data-v-32052700="">
              <span className="heading" data-v-32052700="">
                Crypto &amp; Earn
              </span>
              <span className="divider" data-v-32052700="" />
              <button className="link link_md link_transparent block__link block__title-link" data-v-32052700="" data-v-a7ac1909="">
                <span className="link__body" data-v-a7ac1909="" />
                <span style={{ "--fd873e1a": "1em", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon link__icon" data-v-a7ac1909="" data-v-36d2042d="" data-name="chevron-right">
                  <svg data-v-36d2042d="" viewBox="0 0 24 24">
                    <use href="#icon-chevron-right" data-v-36d2042d="" />
                  </svg>
                </span>
              </button>
            </h2>
            <div data-v-32052700="" className="block__text">
              Stake crypto at up to <span>60% APR</span>, trade, swap and explore NFTs.
            </div>
          </div>
          <button className="link link_md link_transparent block__link" data-v-32052700="" data-v-a7ac1909="">
            <span className="link__body" data-v-a7ac1909="" />
            <span style={{ "--fd873e1a": "1em", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon link__icon" data-v-a7ac1909="" data-v-36d2042d="" data-name="chevron-right">
              <svg data-v-36d2042d="" viewBox="0 0 24 24">
                <use href="#icon-chevron-right" data-v-36d2042d="" />
              </svg>
            </span>
          </button>
        </article>
      </a>
    </section>
  );
}
