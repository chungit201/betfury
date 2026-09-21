"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import FlagSprite, { Flag } from "./FlagSprite";

/**
 * The header gear.
 *
 * The capture shipped the closed button and the `settings--opened` caret, but
 * the panel behind it lived in a Vue chunk that was never fetched — so this is
 * rebuilt from the reference screenshot: two columns of cards, three selects,
 * a sound group and two switches.
 *
 * Every control persists to localStorage. Only "Animation" changes anything on
 * screen today; the rest are preferences waiting for the features that read
 * them (translated copy, fiat conversion, a sound bank, a blocked-games list).
 */

type Option = { code: string; label: string; flag?: string; coin?: string; note?: string };

const LANGUAGES: Option[] = [
  { code: "en", label: "English", flag: "gb" },
  { code: "vi", label: "Tiếng Việt", flag: "vn" },
  { code: "zh", label: "中文", flag: "cn" },
  { code: "ja", label: "日本語", flag: "jp" },
  { code: "ko", label: "한국어", flag: "kr" },
  { code: "es", label: "Español", flag: "es" },
  { code: "pt", label: "Português", flag: "br" },
  { code: "fr", label: "Français", flag: "fr" },
  { code: "de", label: "Deutsch", flag: "de" },
  { code: "ru", label: "Русский", flag: "ru" },
  { code: "tr", label: "Türkçe", flag: "tr" },
  { code: "id", label: "Indonesia", flag: "id" },
];

const FIATS: Option[] = [
  { code: "USD", label: "USD", flag: "us" },
  { code: "EUR", label: "EUR", flag: "eu" },
  { code: "GBP", label: "GBP", flag: "gb" },
  { code: "JPY", label: "JPY", flag: "jp" },
  { code: "BRL", label: "BRL", flag: "br" },
  { code: "TRY", label: "TRY", flag: "tr" },
  { code: "RUB", label: "RUB", flag: "ru" },
  { code: "VND", label: "VND", flag: "vn" },
];

const SPORT_CURRENCIES: Option[] = [
  { code: "USD", label: "USD", flag: "us" },
  { code: "EUR", label: "EUR", flag: "eu" },
  { code: "INUS", label: "INUS", coin: "/images/coins/inus.97293ec5.png" },
  { code: "BTC", label: "BTC", coin: "/images/coins/btc.svg" },
  { code: "ETH", label: "ETH", coin: "/images/coins/eth.svg" },
  { code: "USDT", label: "USDT", coin: "/images/coins/usdt.svg" },
];

const STORE_KEY = "inuslots.settings";

type Settings = {
  language: string;
  fiat: string;
  sportCurrency: string;
  sound: boolean;
  music: number;
  effects: number;
  hideBlocked: boolean;
  animation: boolean;
};

const DEFAULTS: Settings = {
  language: "en",
  fiat: "USD",
  sportCurrency: "USD",
  sound: true,
  music: 60,
  effects: 60,
  hideBlocked: false,
  animation: true,
};

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <span className={`icon${className ? ` ${className}` : ""}`} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <use href={`#icon-${name}`} />
      </svg>
    </span>
  );
}

function OptionIcon({ option, size }: { option: Option; size: number }) {
  if (option.flag) return <Flag code={option.flag} size={size} />;
  return (
    <span className="flag" style={{ width: size, height: size }} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={option.coin} alt="" width={size} height={size} />
    </span>
  );
}

/** One card in the grid: a label, the chosen value, and a list that drops out. */
function SelectCard({
  label,
  options,
  value,
  onChange,
  testId,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (code: string) => void;
  testId: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.code === value) ?? options[0];

  // Closing on outside pointerdown keeps only one list open at a time without
  // the cards having to know about each other.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div className={`settings-select${open ? " settings-select--open" : ""}`} ref={ref} data-select={testId}>
      <button
        type="button"
        className="settings-select__trigger settings-card"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <OptionIcon option={selected} size={32} />
        <span className="settings-select__text">
          <span className="settings-select__label">{label}</span>
          <span className="settings-select__value">{selected.label}</span>
        </span>
        <Icon name="chevron-down" className="settings-select__chevron" />
      </button>

      {open && (
        <ul className="settings-select__list" role="listbox" aria-label={label}>
          {options.map((option) => (
            <li key={option.code}>
              <button
                type="button"
                role="option"
                aria-selected={option.code === value}
                className={`settings-select__option${option.code === value ? " settings-select__option--active" : ""}`}
                onClick={() => {
                  onChange(option.code);
                  setOpen(false);
                }}
              >
                <OptionIcon option={option} size={22} />
                <span className="settings-select__option-label">{option.label}</span>
                {option.code === value && <Icon name="check" className="settings-select__tick" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`settings-switch${on ? " settings-switch--on" : ""}`}
      onClick={() => onChange(!on)}
    >
      <span className="settings-switch__knob" />
    </button>
  );
}

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Read after mount rather than seeding state from localStorage: the server
  // render has no storage, and a different first client render would be a
  // hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* corrupt or unavailable storage just means defaults */
    }
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch {
        /* private mode */
      }
      return next;
    });
  }, []);

  // The one switch that does something today. Scoped to durations rather than
  // `animation: none` so transitions still *happen* — they just land instantly,
  // which leaves the slider and carousels working.
  useEffect(() => {
    document.documentElement.dataset.motion = settings.animation ? "on" : "off";
  }, [settings.animation]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const language = LANGUAGES.find((l) => l.code === settings.language) ?? LANGUAGES[0];

  return (
    <div
      data-v-b6d95528=""
      data-v-a735fa49=""
      className={`settings settings--header header__settings${open ? " settings--opened" : ""}`}
      style={{ "--v70317356": "#242f3f" } as CSSProperties}
      ref={rootRef}
    >
      <FlagSprite />

      <button
        type="button"
        data-v-b6d95528=""
        className="settings__body settings-panel__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Settings"
        ref={triggerRef}
      >
        <Flag code={language.flag!} size={24} />
        <span data-v-b6d95528="" className="settings__line" />
        <span data-v-b6d95528="" className="settings__icon">
          <span
            data-v-36d2042d=""
            data-v-b6d95528=""
            className="icon"
            style={{ "--fd873e1a": "1em", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties}
            data-name="settings"
          >
            <svg data-v-36d2042d="" viewBox="0 0 24 24">
              <use data-v-36d2042d="" href="#icon-settings" />
            </svg>
          </span>
        </span>
      </button>

      {open && (
        <div className="settings-panel" role="dialog" aria-label="Settings">
          <div className="settings-panel__col">
            <SelectCard
              testId="language"
              label="Language"
              options={LANGUAGES}
              value={settings.language}
              onChange={(code) => update({ language: code })}
            />

            <div className="settings-card settings-sound">
              <div className="settings-sound__head">
                <Icon name="volume" className="settings-sound__icon" />
                <span className="settings-sound__title">All Sounds</span>
                <Switch label="All Sounds" on={settings.sound} onChange={(v) => update({ sound: v })} />
              </div>

              <div className="settings-sound__rule" />

              {([
                ["Music", "music", settings.music] as const,
                ["Effects", "effects", settings.effects] as const,
              ]).map(([label, key, value]) => (
                <div className="settings-sound__row" key={key}>
                  <label className="settings-sound__label" htmlFor={`settings-${key}`}>
                    {label}
                  </label>
                  <input
                    id={`settings-${key}`}
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    disabled={!settings.sound}
                    className="settings-slider"
                    style={{ "--fill": `${value}%` } as CSSProperties}
                    onChange={(e) => update({ [key]: Number(e.target.value) } as Partial<Settings>)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="settings-panel__col">
            <SelectCard
              testId="fiat"
              label="Display in fiat"
              options={FIATS}
              value={settings.fiat}
              onChange={(code) => update({ fiat: code })}
            />
            <SelectCard
              testId="sport"
              label="Currency for sports"
              options={SPORT_CURRENCIES}
              value={settings.sportCurrency}
              onChange={(code) => update({ sportCurrency: code })}
            />

            <div className="settings-switches">
              <div className="settings-switches__row">
                <Icon name="eye-off" className="settings-switches__icon" />
                <span className="settings-switches__label">Hide Blocked Games</span>
                <Switch
                  label="Hide Blocked Games"
                  on={settings.hideBlocked}
                  onChange={(v) => update({ hideBlocked: v })}
                />
              </div>
              <div className="settings-switches__row">
                <Icon name="animation" className="settings-switches__icon" />
                <span className="settings-switches__label">Animation</span>
                <Switch label="Animation" on={settings.animation} onChange={(v) => update({ animation: v })} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
