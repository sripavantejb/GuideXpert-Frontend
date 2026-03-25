import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCopy, FiArrowLeft } from 'react-icons/fi';
import { COLLEGES } from '../../data/collegeReferrals';
import { useCounsellorProfile } from '../../contexts/CounsellorProfileContext';
import { openWhatsAppShare } from '../../utils/shareUtils';

const REF_BASE = 'https://guidexpert.in/ref';

export default function CollegeReferralDetail() {
  const { collegeSlug } = useParams();
  const { slug: counsellorSlug } = useCounsellorProfile();
  const [copied, setCopied] = useState(false);

  const college = COLLEGES.find((c) => c.slug === collegeSlug);
  const effectiveSlug = (counsellorSlug && String(counsellorSlug).trim()) || 'me';
  const referralLink = college
    ? college.externalUrl || `${REF_BASE}/${college.slug}/${effectiveSlug}`
    : '';
  const hasSlug = !!(counsellorSlug && String(counsellorSlug).trim());
  const usesExternalUrl = !!(college && college.externalUrl);

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    if (referralLink) openWhatsAppShare(referralLink);
  };

  if (!college) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-600 mb-4">College not found.</p>
          <Link
            to="/counsellor/college-referrals"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#003366] hover:underline"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to College Referrals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/counsellor/college-referrals"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#003366] mb-4"
      >
        <FiArrowLeft className="w-4 h-4" />
        College Referrals
      </Link>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ color: '#003366' }}>
          {college.name}
        </h2>
        {college.location ? (
          <p className="text-sm text-gray-500 mt-0.5">{college.location}</p>
        ) : null}
      </div>

      {!usesExternalUrl && !hasSlug && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          Set your referral slug in Settings to get your personal link. Until then, a default link is shown.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <p className="text-sm text-gray-600 mb-4">
          Share this link with students applying to {college.name}.
        </p>
        <input
          type="text"
          value={referralLink}
          readOnly
          className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 mb-4"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiCopy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Share on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
