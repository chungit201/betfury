"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import SettingsMenu from "./SettingsMenu";

// `data-auth-cta` marks a control as an entry point to the Login / Sign Up
// dialog; AppShell owns the modal and opens it for any of them, picking the tab
// from the control's own wording.
export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  return (
    <header className="header" data-v-6f8a5598="" data-v-a735fa49="">
      <div data-v-6fe13955="" data-v-a735fa49="" className="burger" onClick={onToggleSidebar} role="button" tabIndex={0}>
        <span data-v-36d2042d="" data-v-6fe13955="" className="icon" data-name="hamburger-open" style={{ "--fd873e1a": "24px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties}>
          <svg data-v-36d2042d="" viewBox="0 0 24 24">
            <use data-v-36d2042d="" href="#icon-hamburger-open" />
          </svg>
        </span>
      </div>
      <a aria-current="page" href="/" className="router-link-active router-link-exact-active logo unlink desktop" data-v-a735fa49="" data-v-de3c09c1="">
        {/* Sized in CSS rather than inline: an inline width cannot be overridden
            by a media query, and at 375px the fixed 158px logo ran underneath
            the Log in / Sign Up pair. */}
        <span className="logo__svg header-logo">
          {/* Filename carries a content hash so replacing the artwork changes the
              URL — a same-named file in public/ gets held by the browser and by
              the /_next/image optimizer cache, which both key off the URL. */}
          <Image className="header-logo__img" src="/images/inuslots-logo.58e9460a.png" alt="InuSlots" width={154} height={36} priority />
        </span>
      </a>
      <div data-v-dd43a134="" data-v-a735fa49="" className="bonuses header__bonuses">
        <div data-v-dd43a134="" className="bonuses__bonus-menu" />
        <div data-v-dd43a134="">
          <a data-v-dd43a134="" className="bonus-cabinet bonus-cabinet--unlogged">
            <span className="background background__unactive" />
            <span className="bonus-cabinet__image">
              <span data-v-36d2042d="" className="icon bonus-cabinet__icon" data-name="bonus-cabinet" style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties}>
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use data-v-36d2042d="" href="#icon-bonus-cabinet" />
                </svg>
              </span>
            </span>
            <span className="bonus-cabinet__title">
              Bonuses
            </span>
          </a>
        </div>
      </div>
      <div data-v-a8a1c3ea="" data-v-a735fa49="" className="search-button search v-popper--has-tooltip">
        <span data-v-36d2042d="" data-v-a8a1c3ea="" className="icon search__icon" data-name="search" style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties}>
          <svg data-v-36d2042d="" viewBox="0 0 24 24">
            <use data-v-36d2042d="" href="#icon-search" />
          </svg>
        </span>
      </div>
      <div className="header__wrapper" data-v-a735fa49="">
        <div className="authorization" data-v-a735fa49="" data-v-30453686="">
          <button className="button-flat button-flat_sm button-flat_grey1 button-flat_center" type="button" data-v-30453686="" data-v-194e452b="" data-auth-cta>
            <span className="button-flat__inner" data-v-194e452b="">
              <span className="button-flat__text" data-v-194e452b="">
                Log in
              </span>
            </span>
          </button>
          <button className="button-3d button-3d_sm button-3d_red button-3d_center" type="button" data-v-30453686="" data-v-c8c96dbe="" data-auth-cta>
            <span className="button-3d__outer" data-v-c8c96dbe="">
              <span className="button-3d__inner" data-v-c8c96dbe="">
                <span className="button-3d__text" data-v-c8c96dbe="">
                  Sign Up
                </span>
              </span>
            </span>
          </button>
        </div>
        <SettingsMenu />
        <div className="header__bonuses" data-v-a735fa49="" />
      </div>
    </header>
  );
}
