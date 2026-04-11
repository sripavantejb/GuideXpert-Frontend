/**
 * Webinar certificate download → WhatsApp community invite.
 * Uses a sync-opened placeholder tab so navigation after async work is not popup-blocked.
 */

export const WHATSAPP_COMMUNITY_INVITE_URL =
  'https://chat.whatsapp.com/IlmA9oghb7xG9mVG1Cx1Mi';

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
  if (!placeholderWindow || placeholderWindow.closed) {
    openCommunityInviteFallback();
    return;
  }
  try {
    placeholderWindow.location.replace(WHATSAPP_COMMUNITY_INVITE_URL);
  } catch {
    try {
      placeholderWindow.close();
    } catch (_) {}
    openCommunityInviteFallback();
  }
}

/**
 * If opening the placeholder failed or redirect failed, try direct navigation.
 */
export function openCommunityInviteFallback() {
  const w = window.open(WHATSAPP_COMMUNITY_INVITE_URL, '_blank', 'noopener,noreferrer');
  if (!w) {
    window.location.assign(WHATSAPP_COMMUNITY_INVITE_URL);
  }
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
