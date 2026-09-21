"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import FlagSprite, { Flag } from "./FlagSprite";

/**
 * Login / Sign Up dialog.
 *
 * Registration creates a real account in `pending` — every account is reviewed
 * by hand before it can be used. Signing up therefore does not sign you in,
 * and logging in to an unreviewed account is answered with 403 PENDING, which
 * this renders as "still being reviewed" rather than as a failure.
 */

export type AuthTab = "login" | "signup";

// Only codes whose flag exists in FlagSprite. The first entry is the default.
const DIAL_CODES = [
  { code: "+1", flag: "us", name: "United States" },
  { code: "+84", flag: "vn", name: "Vietnam" },
  { code: "+44", flag: "gb", name: "United Kingdom" },
  { code: "+33", flag: "fr", name: "France" },
  { code: "+49", flag: "de", name: "Germany" },
  { code: "+7", flag: "ru", name: "Russia" },
  { code: "+90", flag: "tr", name: "Türkiye" },
  { code: "+62", flag: "id", name: "Indonesia" },
  { code: "+81", flag: "jp", name: "Japan" },
  { code: "+82", flag: "kr", name: "South Korea" },
  { code: "+86", flag: "cn", name: "China" },
  { code: "+34", flag: "es", name: "Spain" },
  { code: "+55", flag: "br", name: "Brazil" },
];

// Five shown, the rest behind "+3" — the same shape as the reference.
// Commented out with the buttons that use it, at the bottom of the dialog.
// const WALLETS = [
//   { id: "google-white", label: "Google" },
//   { id: "metamask-white", label: "MetaMask" },
//   { id: "telegram-white", label: "Telegram" },
//   { id: "ton-wallet-white", label: "TON Wallet" },
//   { id: "trust-wallet-white", label: "Trust Wallet" },
// ];

const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function FieldIcon({ name }: { name: string }) {
  return (
    <span className="auth-field__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <use href={`#icon-${name}`} />
      </svg>
    </span>
  );
}

export default function AuthModal({
  tab,
  onClose,
  onTabChange,
}: {
  tab: AuthTab | null;
  onClose: () => void;
  onTabChange: (tab: AuthTab) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dial, setDial] = useState(DIAL_CODES[0]);
  const [dialOpen, setDialOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promo, setPromo] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  // Set only after a successful sign-up; shown large above the done text.
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);

  const open = tab !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    emailRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!dialOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!dialRef.current?.contains(e.target as Node)) setDialOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [dialOpen]);

  // Switching tabs keeps what was typed but clears the outcome of the last
  // attempt, which no longer applies.
  useEffect(() => {
    setError("");
    setDone(null);
    setQueuePosition(null);
  }, [tab]);

  // Tabbing out of a modal leaves the visitor typing into controls they cannot
  // see, so focus loops inside it.
  const onKeyDownTrap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(
      'button, input, a[href], [tabindex]:not([tabindex="-1"])'
    )].filter((el) => !el.hasAttribute("disabled"));
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

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");

    if (!LOOKS_LIKE_EMAIL.test(email)) {
      setError("That does not look like an email address.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (tab === "signup" && !agreed) {
      setError("Please confirm you are 18 or over.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(tab === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          tab === "login"
            ? { email, password }
            : { email, password, dialCode: dial.code, phone, promoCode: promo }
        ),
      });
      // A crashed route answers with an empty 500, not JSON. That is a server
      // fault, not the visitor's connection, so it must not land in the catch.
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // A pending account is not an error the visitor can fix by retyping
        // anything, so it gets the confirmation panel rather than the red text
        // under the fields.
        if (data.code === "PENDING") {
          setDone(
            "Your account is still being reviewed. We approve new players by hand — you'll get an email the moment yours is cleared."
          );
        } else if (data.code === "REJECTED") {
          setDone("This account wasn't approved. If you think that's a mistake, reply to the email we sent you.");
        } else if (data.code === "DUPLICATE") {
          setError("That email is already registered. Switch to Login.");
        } else {
          setError(data.error ?? "Something went wrong. Try again.");
        }
        return;
      }

      if (tab === "login") {
        // Approved: the session cookie is already set. A full reload is the
        // honest move until there is a signed-in header to swap in.
        window.location.reload();
        return;
      }

      setQueuePosition(data.position);
      setDone("We check new accounts by hand, and we'll email you the moment yours is approved.");
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="auth-overlay" onMouseDown={onClose}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-label={tab === "login" ? "Login" : "Sign Up"}
        ref={dialogRef}
        onKeyDown={onKeyDownTrap}
        // The overlay closes on click; without this a drag that starts inside
        // and ends on the backdrop would close it too.
        onMouseDown={(e) => e.stopPropagation()}
      >
        <FlagSprite />

        <div className="auth-modal__art">
          <Image
            className="auth-modal__logo"
            src="/images/inuslots-logo.58e9460a.png"
            alt="InuSlots"
            width={154}
            height={36}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* Content-hashed: a same-named file in public/ is held by both the
              browser and the /_next/image cache, which key off the URL. */}
          <img className="auth-modal__mascot" src="/images/modal/auth.d5b4ea79.webp" alt="" />
          <div className="auth-modal__offer">
            <p className="auth-modal__offer-head">
              Welcome
              <br />
              bonus
              <br />
              up to 590%
            </p>
            <p className="auth-modal__offer-sub">+ 225 Free Spins</p>
          </div>
        </div>

        <div className="auth-modal__pane">
          <button type="button" className="auth-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>

          <div className="auth-tabs" role="tablist">
            {(["login", "signup"] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`auth-tab${tab === id ? " auth-tab--active" : ""}`}
                onClick={() => onTabChange(id)}
              >
                {id === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>

          {done ? (
            <div className="auth-done" role="status">
              <span className="auth-done__mark" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <use href="#icon-check" />
                </svg>
              </span>
              {queuePosition !== null && (
                <p className="auth-done__queue">
                  You&apos;re
                  <span className="auth-done__position">#{queuePosition}</span>
                  in the review queue
                </p>
              )}
              <p className="auth-done__text">{done}</p>
              <button type="button" className="auth-submit" onClick={onClose}>
                Back to the floor
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={submit} noValidate>
              <label className="auth-field">
                <FieldIcon name="mail" />
                <input
                  ref={emailRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="auth-field">
                <FieldIcon name="lock" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-field__reveal"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  <svg viewBox="0 0 24 24">
                    <use href={`#icon-${showPassword ? "eye" : "eye-off"}`} />
                  </svg>
                </button>
              </label>

              {tab === "login" ? (
                <button type="button" className="auth-forgot" onClick={() => onTabChange("signup")}>
                  Forgot your password?
                </button>
              ) : (
                <>
                  <div className="auth-field auth-field--phone" ref={dialRef}>
                    <button
                      type="button"
                      className="auth-dial"
                      onClick={() => setDialOpen((v) => !v)}
                      aria-expanded={dialOpen}
                      aria-haspopup="listbox"
                    >
                      <Flag code={dial.flag} size={20} />
                      <span className="auth-dial__code">{dial.code}</span>
                      <span className="auth-dial__chevron" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <use href="#icon-chevron-down" />
                        </svg>
                      </span>
                    </button>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="Phone number (optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    {dialOpen && (
                      <ul className="auth-dial__list" role="listbox" aria-label="Country code">
                        {DIAL_CODES.map((entry) => (
                          <li key={entry.code + entry.flag}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={entry.code === dial.code}
                              className="auth-dial__option"
                              onClick={() => {
                                setDial(entry);
                                setDialOpen(false);
                              }}
                            >
                              <Flag code={entry.flag} size={20} />
                              <span className="auth-dial__option-name">{entry.name}</span>
                              <span className="auth-dial__option-code">{entry.code}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="auth-promo">
                    <button
                      type="button"
                      className="auth-promo__toggle"
                      onClick={() => setPromoOpen((v) => !v)}
                      aria-expanded={promoOpen}
                    >
                      Enter referral/promo code
                      <span className={`auth-promo__chevron${promoOpen ? " auth-promo__chevron--open" : ""}`} aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <use href="#icon-chevron-down" />
                        </svg>
                      </span>
                    </button>
                    {promoOpen && (
                      <label className="auth-field auth-field--promo">
                        <input
                          type="text"
                          placeholder="Promo code"
                          value={promo}
                          onChange={(e) => setPromo(e.target.value)}
                        />
                      </label>
                    )}
                  </div>

                  <label className="auth-consent">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                    <span className="auth-consent__box" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <use href="#icon-check" />
                      </svg>
                    </span>
                    <span className="auth-consent__text">
                      I confirm that I am 18 years old and I have read the{" "}
                      <span className="auth-link">Terms of service</span>
                    </span>
                  </label>
                </>
              )}

              {tab === "login" && (
                <p className="auth-disclaimer">
                  By accessing you confirm that you are at least 18 years old and agree to the{" "}
                  <span className="auth-link">Terms of service</span>
                </p>
              )}

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="auth-submit" disabled={busy}>
                {busy ? "One moment…" : tab === "login" ? "Login" : "Create Account"}
              </button>
            </form>
          )}

          {/* Social / wallet sign-in: hidden until each button has real logic
              behind it. Restore together with WALLETS above.

          <div className="auth-or">
            <span>OR</span>
          </div>

          <div className="auth-wallets">
            {WALLETS.map((wallet) => (
              <button key={wallet.id} type="button" className="auth-wallet" aria-label={wallet.label} data-auth-wallet>
                <svg viewBox="0 0 24 24">
                  <use href={`#icon-${wallet.id}`} />
                </svg>
              </button>
            ))}
            <button type="button" className="auth-wallet auth-wallet--more" aria-label="More options" data-auth-wallet>
              +3
            </button>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}
