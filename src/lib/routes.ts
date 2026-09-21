// The pages that actually exist. Everything else in the captured markup points
// at a route that was never built, so clicking it would land on a 404.
//
// Single source of truth: AppShell's click interceptor reads this to decide
// whether to open the sign-in dialog instead, and the sidebar's Soon badges are
// keyed off the same list.
export const LIVE_ROUTES = new Set(["/", "/about-inus"]);

/**
 * True for links that should be intercepted — internal destinations that have
 * no page behind them. External links, anchors, mailto: and tel: are all left
 * alone: they either work or are not ours to judge.
 */
export function isUnbuiltRoute(href: string | null): boolean {
  if (!href) return false;
  if (!href.startsWith("/")) return false;
  const pathname = href.split(/[?#]/)[0];
  return !LIVE_ROUTES.has(pathname);
}
