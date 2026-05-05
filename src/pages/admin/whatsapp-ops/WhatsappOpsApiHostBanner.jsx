/**
 * Shown when /api/admin/whatsapp-ops/* returns 404 — usually wrong or stale API host (e.g.
 * Vite proxy → production before backend deploy).
 */
export default function WhatsappOpsApiHostBanner({ className = '' }) {
  const isDev = import.meta.env.DEV;

  return (
    <div
      className={`rounded-xl border border-amber-300/90 bg-gradient-to-br from-amber-50 to-orange-50/80 px-4 py-4 text-amber-950 shadow-sm ring-1 ring-amber-900/10 sm:px-5 sm:py-5 ${className}`}
      role="alert"
    >
      <h3 className="text-sm font-bold text-amber-950 sm:text-base">WhatsApp ops API not found (404)</h3>
      <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
        This page calls <code className="rounded bg-white/80 px-1 py-0.5 text-xs font-mono ring-1 ring-amber-200/80">/api/admin/whatsapp-ops/</code>. A 404 means
        the server that handled the request does not expose those routes (common when the frontend proxies to production
        but production has not been updated yet).
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-amber-950/95">
        <li>
          <strong className="font-semibold">Production:</strong> Deploy the latest <code className="font-mono text-xs">GuideXpert-Backend</code> (with{' '}
          <code className="font-mono text-xs">/api/admin/whatsapp-ops</code> in <code className="font-mono text-xs">server.js</code>) and verify{' '}
          <code className="font-mono text-xs">…/api/admin/whatsapp-ops/meta</code> returns 200 with an admin token.
        </li>
        <li>
          <strong className="font-semibold">Local dev:</strong> Run the backend, then copy{' '}
          <code className="font-mono text-xs">.env.development.local.example</code> to <code className="font-mono text-xs">.env.development.local</code> and set{' '}
          <code className="font-mono text-xs">VITE_PROXY_TARGET</code> to your API (e.g. <code className="font-mono text-xs">http://127.0.0.1:5000</code>).
          Restart <code className="font-mono text-xs">npm run dev</code> — the Vite terminal line <code className="font-mono text-xs">[vite] dev proxy: /api → …</code> should
          show that host.
        </li>
        {isDev && (
          <li>
            <strong className="font-semibold">Tip:</strong> See <code className="font-mono text-xs">.env.example</code> — same rule as Poster admin 404 when the proxied backend
            is outdated.
          </li>
        )}
      </ul>
    </div>
  );
}
