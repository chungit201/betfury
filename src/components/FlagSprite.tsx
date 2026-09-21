"use client";

/**
 * Circular flags for the settings panel.
 *
 * Emoji flags were the first attempt and are not an option: Windows ships no
 * glyphs for regional-indicator pairs, so 🇻🇳 renders as the letters "VN" there
 * while showing a real flag on macOS. These are drawn instead, simplified to
 * what still reads at 24-32px — colour blocks and one identifying shape.
 *
 * `<Flag>` references them through `<use>`, so the artwork is emitted once no
 * matter how many lists are open.
 */

// Shared 5-point star, centred on (16,16) with an outer radius of 8. Reused at
// different scales for the Vietnamese, Chinese and Turkish flags.
const STAR =
  "M16 8 17.88 13.41 23.61 13.53 19.04 16.99 20.7 22.47 16 19.2 11.3 22.47 12.96 16.99 8.39 13.53 14.12 13.41Z";

// Twelve stars on a circle of radius 9.5, starting at twelve o'clock.
const EU_STARS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * 30 * Math.PI) / 180;
  return { cx: 16 + 9.5 * Math.sin(angle), cy: 16 - 9.5 * Math.cos(angle) };
});

// Seven of the thirteen stripes; the white ones are the background showing.
const US_STRIPES = [0, 1, 2, 3, 4, 5, 6].map((i) => i * (32 / 13) * 2);

export default function FlagSprite() {
  return (
    <svg aria-hidden="true" focusable="false" style={{ display: "none" }}>
      <symbol id="flag-gb" viewBox="0 0 32 32">
        <path fill="#012169" d="M0 0h32v32H0z" />
        <path stroke="#fff" strokeWidth="7" d="M0 0l32 32M32 0L0 32" />
        <path stroke="#C8102E" strokeWidth="4" d="M0 0l32 32M32 0L0 32" />
        <path stroke="#fff" strokeWidth="11" d="M16 0v32M0 16h32" />
        <path stroke="#C8102E" strokeWidth="6" d="M16 0v32M0 16h32" />
      </symbol>

      <symbol id="flag-us" viewBox="0 0 32 32">
        <path fill="#fff" d="M0 0h32v32H0z" />
        {US_STRIPES.map((y) => (
          <rect key={y} y={y} width="32" height={32 / 13} fill="#B22234" />
        ))}
        <path fill="#3C3B6E" d="M0 0h15v17H0z" />
        {[
          [3, 3], [8, 3], [12.5, 3],
          [5.5, 7], [10, 7],
          [3, 11], [8, 11], [12.5, 11],
          [5.5, 15], [10, 15],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.1" fill="#fff" />
        ))}
      </symbol>

      <symbol id="flag-eu" viewBox="0 0 32 32">
        <path fill="#039" d="M0 0h32v32H0z" />
        {EU_STARS.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r="1.35" fill="#FC0" />
        ))}
      </symbol>

      <symbol id="flag-vn" viewBox="0 0 32 32">
        <path fill="#DA251D" d="M0 0h32v32H0z" />
        <path fill="#FF0" d={STAR} />
      </symbol>

      <symbol id="flag-cn" viewBox="0 0 32 32">
        <path fill="#DE2910" d="M0 0h32v32H0z" />
        <path fill="#FFDE00" d={STAR} transform="translate(9 10.5) scale(.62) translate(-16 -16)" />
        {[[19.5, 4.5], [23.5, 7.5], [23.5, 12.5], [19.5, 15.5]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" fill="#FFDE00" />
        ))}
      </symbol>

      <symbol id="flag-jp" viewBox="0 0 32 32">
        <path fill="#fff" d="M0 0h32v32H0z" />
        <circle cx="16" cy="16" r="8.5" fill="#BC002D" />
      </symbol>

      <symbol id="flag-kr" viewBox="0 0 32 32">
        <path fill="#fff" d="M0 0h32v32H0z" />
        <circle cx="16" cy="16" r="6.8" fill="#CD2E3A" />
        <path fill="#0047A0" d="M16 9.2a6.8 6.8 0 0 1 0 13.6 3.4 3.4 0 0 1 0-6.8 3.4 3.4 0 0 0 0-6.8z" />
        <path stroke="#000" strokeWidth="2.4" strokeLinecap="round" d="M6.4 8.4 8.8 6M25.6 8.4 23.2 6M6.4 23.6 8.8 26M25.6 23.6 23.2 26" />
      </symbol>

      <symbol id="flag-es" viewBox="0 0 32 32">
        <path fill="#F1BF00" d="M0 0h32v32H0z" />
        <path fill="#AA151B" d="M0 0h32v8H0zM0 24h32v8H0z" />
      </symbol>

      <symbol id="flag-br" viewBox="0 0 32 32">
        <path fill="#009B3A" d="M0 0h32v32H0z" />
        <path fill="#FEDF00" d="M16 4 29 16 16 28 3 16z" />
        <circle cx="16" cy="16" r="5.2" fill="#002776" />
      </symbol>

      <symbol id="flag-fr" viewBox="0 0 32 32">
        <path fill="#fff" d="M0 0h32v32H0z" />
        <path fill="#002654" d="M0 0h10.67v32H0z" />
        <path fill="#ED2939" d="M21.33 0H32v32H21.33z" />
      </symbol>

      <symbol id="flag-de" viewBox="0 0 32 32">
        <path fill="#000" d="M0 0h32v10.67H0z" />
        <path fill="#D00" d="M0 10.67h32v10.66H0z" />
        <path fill="#FFCE00" d="M0 21.33h32V32H0z" />
      </symbol>

      <symbol id="flag-ru" viewBox="0 0 32 32">
        <path fill="#fff" d="M0 0h32v10.67H0z" />
        <path fill="#0039A6" d="M0 10.67h32v10.66H0z" />
        <path fill="#D52B1E" d="M0 21.33h32V32H0z" />
      </symbol>

      <symbol id="flag-tr" viewBox="0 0 32 32">
        <path fill="#E30A17" d="M0 0h32v32H0z" />
        <circle cx="13" cy="16" r="7" fill="#fff" />
        <circle cx="15.4" cy="16" r="5.6" fill="#E30A17" />
        <path fill="#fff" d={STAR} transform="translate(22.5 16) scale(.37) translate(-16 -16)" />
      </symbol>

      <symbol id="flag-id" viewBox="0 0 32 32">
        <path fill="#CE1126" d="M0 0h32v16H0z" />
        <path fill="#fff" d="M0 16h32v16H0z" />
      </symbol>
    </svg>
  );
}

export function Flag({ code, size = 32 }: { code: string; size?: number }) {
  return (
    <span className="flag" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 32 32" width={size} height={size}>
        <use href={`#flag-${code}`} />
      </svg>
    </span>
  );
}
