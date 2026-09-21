"use client";

import type { CSSProperties } from "react";
import { currencyLogos } from "@/data/games-data";

export default function Currencies() {
  return (
    <div className="currencies" data-v-7a7ce604="" data-v-67c424fc="">
      <div className="currencies-text" data-v-67c424fc="">
        <span className="currencies-text__count" data-v-67c424fc="">
          18
        </span>
        <span className="currencies-text__label" data-v-67c424fc="">
          Networks
        </span>
      </div>
      <div className="currencies-text" data-v-67c424fc="">
        <span className="currencies-text__count" data-v-67c424fc="">
          40
        </span>
        <span className="currencies-text__label" data-v-67c424fc="">
          Currencies
        </span>
      </div>
      <div className="currencies__logos" data-v-67c424fc="">
        {currencyLogos.map((logo) => (
          <div data-v-67c424fc="" className="currencies-logo" key={logo.name}>
            <figure data-v-183b5307="" data-v-67c424fc="" className="logotype__image" style={{ backgroundColor: "transparent" } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-v-183b5307="" className="lazy-picture__image" draggable={false} src={logo.src} alt={logo.name} width="46" height="46" style={{ borderRadius: "0px" } as CSSProperties} />
            </figure>
          </div>
        ))}
      </div>
      <div className="currencies__link" data-v-67c424fc="">
        <button className="currencies-btn" data-v-67c424fc="">
          Show all
        </button>
      </div>
    </div>
  );
}
