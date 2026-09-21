"use client";

import { useEffect, useRef } from "react";

const MASCOT = "/images/modal/coming-soon.8413f003.webp";

export default function ComingSoonModal({
  destination,
  onClose,
}: {
  // The path the visitor tried to open, shown back to them so the modal
  // explains what it is refusing rather than just refusing.
  destination: string | null;
  onClose: () => void;
}) {
  const okRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!destination) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    okRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [destination, onClose]);

  if (!destination) return null;

  return (
    <div className="cs-overlay" onMouseDown={onClose}>
      <div
        className="cs-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cs-title"
        ref={dialogRef}
        // A drag that starts inside and ends on the backdrop should not close it.
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          // Only two focusable controls, so the trap is just a loop between them.
          if (e.key !== "Tab") return;
          const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
          if (!focusable?.length) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }}
      >
        <div className="cs-modal__top">
          <div className="cs-rays" aria-hidden="true" />
          <button type="button" className="cs-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cs-mascot" src={MASCOT} alt="" width={420} height={461} />
        </div>

        <div className="cs-modal__body">
          <h2 className="cs-title" id="cs-title">
            Coming soon
          </h2>
          <p className="cs-lead">This table isn&apos;t open yet</p>
          <p className="cs-text">
            We&apos;re still building this part of InuSlots. Sign up from the header to join the whitelist and
            we&apos;ll deal you in the moment it goes live.
          </p>
          <button type="button" className="cs-ok" onClick={onClose}>
            OK
          </button>
          <p className="cs-dest">{destination}</p>
        </div>
      </div>
    </div>
  );
}
