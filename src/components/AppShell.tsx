"use client";

import { useCallback, useEffect, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ComingSoonModal from "./ComingSoonModal";
import WhitelistModal from "./WhitelistModal";
import { isUnbuiltRoute } from "@/lib/routes";

// Below this the rail is an overlay drawer rather than a column in the layout.
// Matches the captured stylesheet's own breakpoint, which drops the app's
// left padding to 0 at the same point.
const MOBILE_QUERY = "(max-width: 1023px)";

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [whitelistOpen, setWhitelistOpen] = useState(false);

  /**
   * The burger means two different things by width. On desktop it narrows the
   * rail to an icon strip; on mobile the rail is parked off-canvas by the
   * captured CSS, and the only rule that brings it back sits inside a
   * `min-width: 768px` media query — so below that, collapsing it just made an
   * invisible element narrower. Hence the explicit drawer state.
   */
  const toggleNav = useCallback(() => {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setNavOpen((open) => !open);
    } else {
      setCollapsed((c) => !c);
    }
  }, []);

  // A drawer left open while the viewport grows would sit over the desktop
  // layout with no way to dismiss it.
  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const sync = () => {
      if (!query.matches) setNavOpen(false);
    };
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Escape closes the drawer, and the page behind it must not scroll.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [navOpen]);

  /**
   * Most of the captured markup links to pages that were never built — game
   * tiles, sidebar rows, footer menus, in-copy links. Rather than editing
   * hundreds of anchors, one capture-phase listener on the shell catches any
   * click headed somewhere that does not exist and explains instead.
   *
   * Capture phase specifically: it has to run before the anchor's own default,
   * and before any handler a child might add later.
   */
  const interceptUnbuiltLinks = useCallback((event: MouseEvent) => {
    // Let modified clicks through — a new tab on a 404 is the visitor's call.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    const element = event.target as HTMLElement;

    // Every "log in", "sign up" and wallet-connect control on the site is an
    // entry point to the same pre-launch whitelist, marked with one attribute
    // so they do not each need their own state and handler.
    if (element.closest("[data-auth-cta]")) {
      event.preventDefault();
      setWhitelistOpen(true);
      return;
    }

    if (element.closest(".left-menu a")) setNavOpen(false);

    const anchor = element.closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!isUnbuiltRoute(href)) return;

    event.preventDefault();
    setComingSoon(href);
  }, []);

  return (
    <div
      className={[
        "app",
        collapsed ? "opened-left-panel-short" : "opened-left-panel",
        navOpen ? "app--nav-open" : "",
      ].filter(Boolean).join(" ")}
      data-v-6f8a5598=""
      style={{ "--left-panel-width": collapsed ? "52px" : "232px" } as CSSProperties}
      onClickCapture={interceptUnbuiltLinks}
    >
      <Header onToggleSidebar={toggleNav} />
      <Sidebar collapsed={collapsed} />
      {/* Tapping away from an overlay drawer is the expected way to dismiss it. */}
      {navOpen && <div className="nav-scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />}
      {children}
      <ComingSoonModal destination={comingSoon} onClose={() => setComingSoon(null)} />
      <WhitelistModal open={whitelistOpen} onClose={() => setWhitelistOpen(false)} />
    </div>
  );
}
