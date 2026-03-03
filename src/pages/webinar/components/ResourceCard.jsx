import { FiFileText, FiExternalLink, FiDownload } from 'react-icons/fi';
import { getSessionById } from '../data/mockWebinarData';

const TYPE_CONFIG = {
  pdf: { icon: FiFileText, label: 'Download', actionIcon: FiDownload },
  document: { icon: FiFileText, label: 'Download', actionIcon: FiDownload },
  link: { icon: FiExternalLink, label: 'Open', actionIcon: FiExternalLink },
};

export default function ResourceCard({ resource }) {
  const conf = TYPE_CONFIG[resource.type] ?? TYPE_CONFIG.document;
  const Icon = conf.icon;
  const ActionIcon = conf.actionIcon;
  const session = resource.sessionId ? getSessionById(resource.sessionId) : null;

  const handleAction = () => {
    if (resource.url && resource.url !== '#') {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article
      className="rounded-[20px] border border-gray-200 bg-white shadow-card overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col h-full"
      aria-label={resource.title}
    >
      <div className="p-5 flex flex-col flex-1">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-navy/10 text-primary-navy flex items-center justify-center">
            <Icon className="w-6 h-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {resource.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
            {resource.category}
          </span>
          {resource.format && (
            <span className="text-xs text-gray-500">{resource.format}</span>
          )}
        </div>
        {session && (
          <p className="text-xs text-gray-500 mt-2">
            Related to: <span className="text-gray-700 font-medium">{session.title}</span>
          </p>
        )}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleAction}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-navy text-white text-sm font-medium hover:bg-primary-navy/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
            aria-label={`${conf.label} ${resource.title}`}
          >
            <ActionIcon className="w-4 h-4" aria-hidden />
            {conf.label}
          </button>
        </div>
      </div>
    </article>
  );
}
