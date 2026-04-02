export async function copyTextToClipboard(text) {
  const value = text == null ? '' : String(text);
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_err) {
      // Fall back to execCommand for browsers with blocked async clipboard.
    }
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard not available');
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    const success = document.execCommand('copy');
    if (!success) throw new Error('Copy command failed');
    return true;
  } finally {
    document.body.removeChild(textarea);
  }
}
