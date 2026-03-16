import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCounsellorTraining, TRAINING_MODULES } from '../../contexts/CounsellorTrainingContext';

export default function CounsellorTraining() {
  const [searchParams] = useSearchParams();
  const { currentModule, setCurrentModule, markCompleted } = useCounsellorTraining();

  const moduleIdParam = searchParams.get('module');
  useEffect(() => {
    const id = moduleIdParam ? parseInt(moduleIdParam, 10) : null;
    if (id >= 1 && id <= TRAINING_MODULES.length) {
      setCurrentModule(id);
    }
  }, [moduleIdParam, setCurrentModule]);

  const module = TRAINING_MODULES.find((m) => m.id === currentModule) || TRAINING_MODULES[0];

  return (
    <div id="main-content" className="flex flex-col min-h-0">
      <div className="rounded-xl border border-gray-200 bg-white shadow-card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">{module.label}</h2>
        <p className="text-sm text-gray-500 mb-4">
          Module {currentModule} of {TRAINING_MODULES.length} · Type: {module.type}
        </p>
        <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
          {module.type === 'video' && (
            <p className="text-gray-500 text-sm">Video content for {module.label} will load here.</p>
          )}
          {module.type === 'assessment' && (
            <p className="text-gray-500 text-sm">Assessment for {module.label} will load here.</p>
          )}
          {module.type === 'certificate' && (
            <p className="text-gray-500 text-sm">Certificate download and details will appear here.</p>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => markCompleted(module.id)}
            className="px-4 py-2 rounded-lg bg-accent-green text-white text-sm font-semibold hover:bg-accent-green/90 transition-colors"
          >
            Mark as completed
          </button>
        </div>
      </div>
    </div>
  );
}
