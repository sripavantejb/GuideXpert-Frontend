/**
 * Converts plain-text announcement description into safe HTML for display.
 * - Strips any existing HTML (backward compat)
 * - Escapes HTML entities (XSS-safe)
 * - Linkifies http(s) URLs
 * - Converts newlines to <br />
 * - Lines starting with "- " become <ul><li>...</li></ul>
 */

function escapeHtml(text) {
  if (text == null || typeof text !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (ch) => map[ch]);
}

function stripHtmlTags(html) {
  if (html == null || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

const URL_REGEX = /https?:\/\/[^\s<>"']+/gi;

function linkifyUrls(text) {
  return text.replace(URL_REGEX, (url) => {
    const escaped = escapeHtml(url);
    return `<a href="${escaped}" target="_blank" rel="noopener noreferrer">${escaped}</a>`;
  });
}

/**
 * @param {string} raw - Raw description (plain text or legacy HTML)
 * @returns {string} Safe HTML for dangerouslySetInnerHTML
 */
export function formatAnnouncementDescription(raw) {
  if (raw == null || typeof raw !== 'string') return '';
  let text = raw.trim();
  if (!text) return '';

  // Strip HTML if present (backward compat)
  if (/<[^>]+>/.test(text)) {
    text = stripHtmlTags(text);
  }

  text = escapeHtml(text);

  // Build output: handle "- " list lines, then linkify, then br for newlines
  const lines = text.split('\n');
  const parts = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trimStart();
    const isBullet = trimmed.startsWith('- ');

    if (isBullet) {
      const listItems = [];
      while (i < lines.length && lines[i].trimStart().startsWith('- ')) {
        listItems.push(linkifyUrls(lines[i].trimStart().slice(2)));
        i++;
      }
      parts.push('<ul class="list-disc pl-5 my-2 space-y-0.5">');
      listItems.forEach((li) => parts.push(`<li>${li}</li>`));
      parts.push('</ul>');
      if (i < lines.length) parts.push('<br />');
      continue;
    }

    parts.push(linkifyUrls(line));
    if (i < lines.length - 1) parts.push('<br />');
    i++;
  }

  return parts.join('');
}
