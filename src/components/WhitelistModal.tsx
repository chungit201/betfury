"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { tokenAssets } from "@/data/token-data";

type Status = "idle" | "sending" | "done" | "error";

const PERKS = [
  "First access when the games go live",
  "Bonus INUS dropped straight to your wallet",
  "Founder badge — only ever given out once",
];

// The headline offer, pulled out of the perk list so it reads as the reason to
// sign up rather than one bullet among three.
const BONUS = {
  headline: "Welcome bonus up to 590%",
  sub: "+ 225 Free Spins",
};

export default function WhitelistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Escape closes, and the page behind must not scroll while the sheet is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  // Keep focus inside the dialog: tabbing out to the page behind it leaves the
  // visitor typing into controls they cannot see.
  const onKeyDownTrap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, input, a[href], [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
        return;
      }
      setPosition(data.position ?? null);
      setMessage(data.alreadyJoined ? "You were already on the list — we kept your spot." : "");
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Check your connection.");
    }
  }

  if (!open) return null;

  return (
    <div className="wl-overlay" onMouseDown={onClose}>
      <div
        className="wl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wl-title"
        ref={dialogRef}
        onKeyDown={onKeyDownTrap}
        // The overlay closes on click; without this, a click that starts inside
        // the dialog and drifts onto the backdrop would close it too.
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="wl-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="wl-glow" aria-hidden="true" />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="wl-coin" src={tokenAssets.coin} alt="" width={72} height={72} />

        {status === "done" ? (
          <>
            <span className="wl-kicker">You&apos;re in</span>
            <h2 className="wl-title" id="wl-title">
              Seat reserved at the table
            </h2>
            <p className="wl-text">
              {position ? (
                <>
                  You&apos;re <strong>#{position}</strong> on the whitelist. We&apos;ll email you the moment the doors open.
                </>
              ) : (
                <>We&apos;ll email you the moment the doors open.</>
              )}
            </p>
            {message && <p className="wl-note">{message}</p>}
            <button type="button" className="wl-submit" onClick={onClose}>
              Back to the floor
            </button>
          </>
        ) : (
          <>
            <span className="wl-kicker">Whitelist · closing soon</span>
            <h2 className="wl-title" id="wl-title">
              The house isn&apos;t open yet
            </h2>
            <p className="wl-text">
              InuSlots is dealing in the first players before launch. Claim a seat now and your welcome package is waiting when the doors open.
            </p>

            <div className="wl-bonus">
              <span className="wl-bonus__headline">{BONUS.headline}</span>
              <span className="wl-bonus__sub">{BONUS.sub}</span>
            </div>

            <ul className="wl-perks">
              {PERKS.map((perk) => (
                <li key={perk}>
                  <span className="wl-perks__tick" aria-hidden="true">
                    ✦
                  </span>
                  {perk}
                </li>
              ))}
            </ul>

            <form className="wl-form" onSubmit={onSubmit} noValidate>
              <input
                ref={inputRef}
                className="wl-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={status === "error"}
                aria-describedby={status === "error" ? "wl-error" : undefined}
                required
              />
              <button type="submit" className="wl-submit" disabled={status === "sending" || !email.trim()}>
                {status === "sending" ? "Dealing you in…" : "Join the whitelist"}
              </button>
            </form>

            {status === "error" && (
              <p className="wl-error" id="wl-error" role="alert">
                {message}
              </p>
            )}

            <p className="wl-fineprint">
              One email when we launch. No spam, no resale. 18+ only — please play responsibly.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
