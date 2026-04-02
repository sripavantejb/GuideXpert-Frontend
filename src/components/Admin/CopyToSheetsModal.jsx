import { useState, useEffect } from 'react';
import { copyTextToClipboard } from '../../utils/clipboard';

function escapeTsvCell(val) {
  if (val == null) return '';
  const s = String(val);
  if (/[\t\n"]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function normalizePhone(val) {
  if (val == null) return '';
  return String(val).replace(/\D/g, '').trim();
}

export function dedupeByPhone(records, phoneKey) {
  const seen = new Set();
  return records.filter((r) => {
    const key = normalizePhone(r[phoneKey]);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildTsv(records, fields, getCellValue, selectedKeys) {
  const keys = selectedKeys.filter((k) => fields.some((f) => f.key === k));
  const labels = keys.map((k) => fields.find((f) => f.key === k)?.label ?? k);
  const header = labels.join('\t');
  const rows = records.map((record) =>
    keys.map((k) => escapeTsvCell(getCellValue(record, k))).join('\t')
  );
  return [header, ...rows].join('\n');
}

/**
 * Reusable "Copy to sheets" modal: column checkboxes + Copy to clipboard.
 * @param {Object} props
 * @param {Array<{ key: string, label: string }>} props.fields - COPY_FIELDS
 * @param {Array} props.records - current list to copy
 * @param {function(record, key): string} props.getCellValue - get display value for a cell
 * @param {boolean} props.open
 * @param {function(): void} props.onClose
 * @param {string} [props.recordLabel='records'] - e.g. 'leads', 'responses' for message
 * @param {string} [props.dedupeByPhoneKey] - e.g. 'phone', 'mobileNumber'; deduplicate by normalized phone before copy
 */
export default function CopyToSheetsModal({
  fields,
  records,
  getCellValue,
  open,
  onClose,
  recordLabel = 'records',
  dedupeByPhoneKey,
  loading = false,
  loadingMessage = 'Preparing all matching data for copy...',
}) {
  const [copySelectedFields, setCopySelectedFields] = useState(() => fields.map((f) => f.key));
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    if (open) {
      setCopySelectedFields(fields.map((f) => f.key));
      setCopyFeedback(false);
    }
  }, [open, fields]);

  if (!open) return null;

  const toCopy = dedupeByPhoneKey ? dedupeByPhone(records, dedupeByPhoneKey) : records;
  const count = toCopy.length;
  const duplicateRemoved = dedupeByPhoneKey && records.length !== toCopy.length;
  const singular = recordLabel.replace(/s$/, '') || recordLabel;
  const message =
    loading
      ? loadingMessage
      : count === 0
      ? `No data to copy. Load ${recordLabel} with the current filters first.`
      : duplicateRemoved
        ? `Choose columns to include. Data will be copied for ${count} unique ${count === 1 ? singular : recordLabel} (duplicates by phone removed).`
        : `Choose columns to include. Data will be copied for all ${count === 1 ? singular : recordLabel} matching current filters.`;

  const handleCopy = () => {
    const tsv = buildTsv(toCopy, fields, getCellValue, copySelectedFields);
    copyTextToClipboard(tsv).then(() => {
      setCopyFeedback(true);
      setTimeout(() => {
        onClose();
        setCopyFeedback(false);
      }, 1500);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="copy-modal-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 id="copy-modal-title" className="font-semibold text-gray-800">
            Copy to sheets
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600 mb-4">{message}</p>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={copySelectedFields.length === fields.length}
                ref={(el) => {
                  if (el)
                    el.indeterminate =
                      copySelectedFields.length > 0 && copySelectedFields.length < fields.length;
                }}
                onChange={(e) => {
                  setCopySelectedFields(e.target.checked ? fields.map((f) => f.key) : []);
                }}
                className="rounded border-gray-300 text-primary-blue-500 focus:ring-primary-blue-500"
                aria-label="Select all columns"
              />
              Select all
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-1">
              {fields.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={copySelectedFields.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCopySelectedFields((prev) => [...prev, key]);
                      } else {
                        setCopySelectedFields((prev) => prev.filter((k) => k !== key));
                      }
                    }}
                    className="rounded border-gray-300 text-primary-blue-500 focus:ring-primary-blue-500"
                    aria-label={`Include ${label}`}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          {copySelectedFields.length === 0 && toCopy.length > 0 && (
            <p className="text-sm text-amber-600 mt-2">Select at least one column to copy.</p>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={loading || toCopy.length === 0 || copySelectedFields.length === 0}
            className="px-4 py-2 rounded-lg bg-primary-navy text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {copyFeedback ? 'Copied!' : 'Copy to clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
