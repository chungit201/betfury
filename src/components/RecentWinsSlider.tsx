"use client";

import type { CSSProperties } from "react";
import { recentWins } from "@/data/games-data";

export default function RecentWinsSlider() {
  return (
    <section className="section section--recent-top-wins sliders__slider" data-v-bbc21d8c="" data-v-2c401be8="">
      <header className="section__header" data-v-2c401be8="">
        <div className="header-block" data-v-2c401be8="">
          <h2 className="section__title" data-v-2c401be8="">
            <span data-v-2c401be8="">Recent Top Wins</span>
          </h2>
        </div>
        <div data-v-2c401be8="" className="header-block header-block--no-gap">
          <div data-v-2c401be8="" className="carousel-controls">
            <button data-v-30d1fca4="" data-v-2c401be8="" type="button" className="control-button">
              <span data-v-36d2042d="" data-v-30d1fca4="" className="icon" style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} data-name="chevron-left">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use data-v-36d2042d="" href="#icon-chevron-left" />
                </svg>
              </span>
            </button>
            <button data-v-30d1fca4="" data-v-2c401be8="" type="button" className="control-button">
              <span data-v-36d2042d="" data-v-30d1fca4="" className="icon" style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} data-name="chevron-right">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use data-v-36d2042d="" href="#icon-chevron-right" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </header>
      <div className="section__content" style={{ minHeight: "171px" } as CSSProperties} data-v-2c401be8="">
        <div className="embla" data-v-2c401be8="">
          <div className="embla__viewport" data-v-2c401be8="">
            <ul className="embla__container" data-v-2c401be8="">
              {recentWins.map((win, i) => (
                <li className="embla__slide" data-v-2c401be8="" key={`${win.href}-${i}`}>
                  <div className="embla__slide-inner" data-v-2c401be8="">
                    <div className="embla__list" data-v-2c401be8="">
                      <div className="embla__list-item" data-v-2c401be8="">
                        <div data-v-2c401be8="" data-v-4aba23a7="">
                          <div data-v-4aba23a7="" className="card-wrapper" role="button" tabIndex={0}>
                            <div data-v-4aba23a7="" className="card__badge card__badge--last-wins">
                              <span data-v-e167b1c8="" data-v-4aba23a7="" className="currency currency--slice currency">
                                <span data-v-e167b1c8="" style={{ color: "white" } as CSSProperties}>
                                  <div data-v-e167b1c8="" className="currency__body" style={{ fontSize: "14px" } as CSSProperties}>
                                    <div data-v-e167b1c8="" className="currency__data">
                                      <span data-v-9ea0d0c4="" data-v-e167b1c8="" className="balance">
                                        {win.balance}
                                      </span>
                                    </div>
                                  </div>
                                </span>
                              </span>
                              <div data-v-eddcac09="" data-v-4aba23a7="" className="user">
                                <div data-v-eddcac09="" className="user__avatar" style={{ width: "16px", height: "16px" } as CSSProperties}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img className={'w-full h-full'} src={win.avatar} alt="" width={16} height={16} style={{ borderRadius: "50%" } as CSSProperties} />
                                </div>
                                <div data-v-eddcac09="" className="user__wrap">
                                  <span data-v-eddcac09="" className="user__name">
                                    {win.user}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <a data-v-4aba23a7="" href={win.href} className="card card--default">
                              <div data-v-1f9998f1="" data-v-4aba23a7="" className="wrapper is-loaded card__image">
                                <picture data-v-1f9998f1="">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img className="img" draggable={false} src={win.image} alt={win.user} loading="lazy" width="131" height="175" data-v-1f9998f1="" />
                                </picture>
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
