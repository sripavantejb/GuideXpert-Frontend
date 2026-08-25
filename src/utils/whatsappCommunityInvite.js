/**
 * Webinar certificate download → WhatsApp community invite.
 * Uses a sync-opened placeholder tab so navigation after async work is not popup-blocked.
 */

export const WHATSAPP_COMMUNITY_INVITE_URL =
  'https://chat.whatsapp.com/IlmA9oghb7xG9mVG1Cx1Mi';

/** Certified Counsellors 2026-27 (Onboarded) — after activation form. */
export const WHATSAPP_ONBOARDED_COMMUNITY_INVITE_URL =
  'https://chat.whatsapp.com/J2CtxkhLUk4BdsErplPCki';

/**
 * Call synchronously from a click handler before any await.
 * @returns {Window|null}
 */
export function openCommunityRedirectPlaceholder() {
  return window.open('about:blank', '_blank');
}

/**
 * After certificate file save succeeds, point the placeholder tab at WhatsApp.
 * @param {Window|null} placeholderWindow
 */
export function navigatePlaceholderToCommunity(placeholderWindow) {
  navigatePlaceholderToUrl(placeholderWindow, WHATSAPP_COMMUNITY_INVITE_URL);
}

export function navigatePlaceholderToOnboardedCommunity(placeholderWindow) {
  navigatePlaceholderToUrl(placeholderWindow, WHATSAPP_ONBOARDED_COMMUNITY_INVITE_URL);
}

function navigatePlaceholderToUrl(placeholderWindow, url) {
  if (!placeholderWindow || placeholderWindow.closed) {
    openCommunityInviteFallback(url);
    return;
  }
  try {
    placeholderWindow.location.replace(url);
  } catch {
    try {
      placeholderWindow.close();
    } catch (_) {}
    openCommunityInviteFallback(url);
  }
}

/**
 * If opening the placeholder failed or redirect failed, try direct navigation.
 */
export function openCommunityInviteFallback(url = WHATSAPP_COMMUNITY_INVITE_URL) {
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (!w) {
    window.location.assign(url);
  }
}

/** Same-tab redirect after public activation form submit. */
export function redirectToOnboardedCommunity() {
  window.location.assign(WHATSAPP_ONBOARDED_COMMUNITY_INVITE_URL);
}

/**
 * On download failure: close blank tab if still open.
 * @param {Window|null} placeholderWindow
 */
export function closeCommunityRedirectPlaceholder(placeholderWindow) {
  if (!placeholderWindow || placeholderWindow.closed) return;
  try {
    placeholderWindow.close();
  } catch (_) {}
}
