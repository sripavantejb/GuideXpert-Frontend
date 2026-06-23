import { FiAlertTriangle } from 'react-icons/fi';

export default function CopilotWhatsAppStatusBanner({ config, loading }) {
  if (loading || !config) return null;

  const { integrationStub, gupshupConfigured, whatsappEnabled } = config;
  const blocked = integrationStub || !gupshupConfigured || !whatsappEnabled;

  if (!blocked) return null;

  let detail = 'Messages will not reach WhatsApp until Gupshup is configured and stub mode is off.';
  if (integrationStub) {
    detail = 'WA_INTEGRATION_STUB is enabled — replies are simulated and will not be delivered to leads.';
  } else if (!whatsappEnabled) {
    detail = 'WhatsApp outbound is disabled (ENABLE_WHATSAPP). Replies will not be delivered.';
  } else if (!gupshupConfigured) {
    detail = 'Gupshup is not configured (GUPSHUP_API_KEY / GUPSHUP_SOURCE). Replies will not be delivered.';
  }

  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
      <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{detail}</span>
    </div>
  );
}
