import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useCounsellorProfile } from '../../contexts/CounsellorProfileContext';
import CertificatePreview from '../../components/Counsellor/CertificatePreview';

function formatDateForCertificate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function safeFilename(str) {
  return (str || 'certificate').replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').slice(0, 60);
}

export default function Certificate() {
  const { displayName } = useCounsellorProfile();
  const [recipientName, setRecipientName] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [generating, setGenerating] = useState(false);
  const certRef = useRef(null);

  const dateFormatted = formatDateForCertificate(dateValue);

  const handleDownloadPng = async () => {
    if (!certRef.current) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 100));
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `GuideXpert-Certificate-${safeFilename(recipientName)}-${dateFormatted.replace(/-/g, '')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    }
    setGenerating(false);
  };

  const handleDownloadPdf = async () => {
    if (!certRef.current) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 100));
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1684, 1190],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 1684, 1190);
      pdf.save(`GuideXpert-Certificate-${safeFilename(recipientName)}-${dateFormatted.replace(/-/g, '')}.pdf`);
    } catch (err) {
      console.error(err);
    }
    setGenerating(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Certificate</h1>
      <p className="text-gray-600 mb-6">Generate and download certificates of achievement.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Recipient name</span>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter recipient name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Date</span>
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Signature name (issuer)</span>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Counsellor name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </label>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={generating}
              className="inline-flex items-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 disabled:opacity-60"
            >
              {generating ? 'Generating…' : 'Download as PNG'}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={generating}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
            >
              {generating ? 'Generating…' : 'Download as PDF'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 flex justify-center overflow-auto bg-gray-100 rounded-lg p-4 min-h-[400px]">
          <div style={{ transform: 'scale(0.65)', transformOrigin: 'top center' }}>
            <CertificatePreview
              ref={certRef}
              recipientName={recipientName}
              date={dateFormatted}
              signatureName={signatureName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
