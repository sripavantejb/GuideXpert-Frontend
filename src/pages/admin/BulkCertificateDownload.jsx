import { useMemo, useState } from 'react';
import { FiAward, FiDownload, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { bulkDownloadCertificates } from '../../utils/adminApi';

const MAX_PHONES = 200;

function parsePhonesFromText(text) {
  const raw = String(text || '')
    .split(/[\n,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set();
  const valid = [];
  const invalid = [];

  for (const item of raw) {
    const digits = item.replace(/\D/g, '');
    const mobile = digits.length >= 10 ? digits.slice(-10) : digits;
    if (mobile.length !== 10) {
      invalid.push(item);
      continue;
    }
    if (seen.has(mobile)) continue;
    seen.add(mobile);
    valid.push(mobile);
  }

  return { valid, invalid };
}

export default function BulkCertificateDownload() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { valid, invalid } = useMemo(() => parsePhonesFromText(text), [text]);
  const overLimit = valid.length > MAX_PHONES;

  const handleDownload = async () => {
    setError('');
    setSuccess('');
    if (valid.length === 0) {
      setError('Enter at least one valid 10-digit mobile number.');
      return;
    }
    if (overLimit) {
      setError(`Maximum ${MAX_PHONES} numbers per download.`);
      return;
    }

    setLoading(true);
    try {
      const result = await bulkDownloadCertificates({
        mobileNumbers: valid,
        mobileNumbersText: text,
      });
      if (!result.success) {
        setError(result.message || 'Download failed.');
        return;
      }
      setSuccess(`Download started for ${valid.length} number(s). Open the PNG/PDF files in the certificates folder (manifest.csv is only a summary).`);
    } catch (e) {
      setError(e?.message || 'Download failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <FiAward className="w-7 h-7 text-[#003366]" aria-hidden />
        <h1 className="text-xl font-bold text-gray-900">Bulk certificate download</h1>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Paste mobile numbers to download certificates (PNG + PDF) with name, certificate ID, dates, and mobile printed on each file, plus a manifest CSV.
      </p>

      <div className="rounded-lg border border-blue-100 bg-blue-50/80 p-3 mb-4 flex gap-2 text-sm text-blue-900">
        <FiInfo className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
        <p>
          Only users with an existing certificate record receive image files. Numbers without a record appear as{' '}
          <code className="text-xs bg-white/80 px-1 rounded">not_found</code> in <strong>manifest.csv</strong>.
        </p>
      </div>

      <label htmlFor="bulk-cert-phones" className="block text-sm font-medium text-gray-700 mb-1">
        Mobile numbers
      </label>
      <textarea
        id="bulk-cert-phones"
        rows={10}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366]"
        placeholder={'9876543210\n9123456789\n…'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />

      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
        <span>
          Valid: <strong className={overLimit ? 'text-red-600' : 'text-gray-900'}>{valid.length}</strong>
          {overLimit ? ` (max ${MAX_PHONES})` : ''}
        </span>
        {invalid.length > 0 && (
          <span className="text-amber-700">
            Invalid lines: {invalid.length}
          </span>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <FiAlertCircle className="w-5 h-5 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <button
        type="button"
        onClick={handleDownload}
        disabled={loading || valid.length === 0 || overLimit}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#003366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiDownload className="w-4 h-4" aria-hidden />
        {loading ? 'Preparing ZIP…' : 'Download ZIP'}
      </button>
    </div>
  );
}
