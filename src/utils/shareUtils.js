export function getWhatsAppShareUrl(text) {
  const encoded = encodeURIComponent(text);
  return `https://wa.me/?text=${encoded}`;
}

export function openWhatsAppShare(text) {
  window.open(getWhatsAppShareUrl(text), '_blank', 'noopener,noreferrer');
}
