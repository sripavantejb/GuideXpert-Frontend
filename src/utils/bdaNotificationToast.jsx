import { toast } from 'react-toastify';

const TOAST_TYPES = new Set(['lead_assigned', 'lead_reassigned_in', 'lead_reassigned_out']);

function toastVariant(type) {
  if (type === 'lead_assigned') return 'success';
  if (type === 'lead_reassigned_in') return 'info';
  if (type === 'lead_reassigned_out') return 'warning';
  return 'default';
}

/**
 * Show a toast when a new BDA notification arrives (assignment / reassignment).
 */
export function showBdaNotificationToast(item, { onLeadClick } = {}) {
  if (!item?.id || !TOAST_TYPES.has(item.type)) return;

  const variant = toastVariant(item.type);
  const title = item.type === 'lead_assigned'
    ? 'New lead assigned'
    : item.type === 'lead_reassigned_in'
      ? 'Lead reassigned to you'
      : 'Lead reassigned away';

  const canOpenLead = item.leadId && onLeadClick && item.type !== 'lead_reassigned_out';

  const content = (
    <div className="text-sm leading-snug">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-gray-700 mt-0.5">{item.message}</p>
      {canOpenLead && (
        <p className="text-xs text-primary-blue mt-1.5 font-medium">Tap to view lead</p>
      )}
    </div>
  );

  const options = {
    toastId: item.id,
    autoClose: 8000,
    onClick: () => {
      if (canOpenLead) onLeadClick(item.leadId, item.leadType || 'iit_counselling');
    },
  };

  if (variant === 'success') toast.success(content, options);
  else if (variant === 'info') toast.info(content, options);
  else if (variant === 'warning') toast.warning(content, options);
  else toast(content, options);
}
