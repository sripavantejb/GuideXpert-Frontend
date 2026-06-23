import CopilotNotificationBanner from './CopilotNotificationBanner';
import CopilotWhatsAppStatusBanner from './CopilotWhatsAppStatusBanner';

export default function CopilotAlertStrip({
  alertCount,
  alertsLoading,
  copilotConfig,
  configLoading,
  actionError,
  detailError,
}) {
  const hasAlerts =
    alertCount > 0 ||
    actionError ||
    detailError ||
    (copilotConfig &&
      (copilotConfig.integrationStub ||
        !copilotConfig.gupshupConfigured ||
        !copilotConfig.whatsappEnabled));

  if (!hasAlerts && !configLoading && !alertsLoading) return null;

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <CopilotWhatsAppStatusBanner config={copilotConfig} loading={configLoading} />
      <CopilotNotificationBanner count={alertCount} loading={alertsLoading} />
      {actionError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {actionError}
        </div>
      ) : null}
      {detailError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {detailError}
        </div>
      ) : null}
    </div>
  );
}
