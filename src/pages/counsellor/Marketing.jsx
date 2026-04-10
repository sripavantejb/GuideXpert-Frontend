import { Link } from 'react-router-dom';

/** Seasonal and official poster flows (full customise & download on dedicated pages). */
const AUTOMATED_POSTERS = [
  {
    id: 'holi',
    title: 'Holi',
    description: 'Seasonal poster with your name and phone. Download PNG or PDF after eligibility check.',
    to: '/holiposter',
    previewSrc: '/holiposter.svg',
  },
  {
    id: 'inter',
    title: 'Inter',
    description: 'Counsellor poster template. Customise and download from the dedicated page.',
    to: '/interposter',
    previewSrc: '/interposter.svg',
  },
  {
    id: 'gx',
    title: 'GX Poster',
    description: 'New GX campaign poster with your name and mobile at the bottom-right.',
    to: '/gx-poster',
    previewSrc: '/gx-poster.svg',
  },
  {
    id: 'sid',
    title: 'SID Poster',
    description: 'SID campaign poster with your name and mobile. Download PNG or PDF after eligibility check.',
    to: '/sid-poster',
    previewSrc: '/sid-poster.svg',
  },
  {
    id: 'btechcse',
    title: 'B.Tech CSE Poster',
    description: 'B.Tech CSE campaign poster with your name and mobile. Download PNG or PDF after eligibility check.',
    to: '/btechcse-poster',
    previewSrc: '/btechcse-poster.svg',
  },
  {
    id: 'certified',
    title: 'Official certified poster',
    description: 'Your certified counsellor poster from the standard template.',
    to: '/counsellor/certificate',
    previewSrc: '/downloadcertificate.svg',
  },
];

export default function Marketing() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#003366] tracking-tight">All marketing posters</h2>
        <p className="text-sm text-slate-600 mt-0.5">
          Open seasonal and official templates in their dedicated pages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {AUTOMATED_POSTERS.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col"
          >
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 mb-3 w-fit">
              Seasonal / official
            </span>
            <div className="flex justify-center mb-4 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden min-h-[200px] max-h-[280px]">
              <img
                src={item.previewSrc}
                alt=""
                className="max-w-full max-h-[260px] w-auto object-contain object-center"
              />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-600 mb-4 flex-1">{item.description}</p>
            <Link
              to={item.to}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080] transition-colors text-center"
            >
              Open to customise &amp; download
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
