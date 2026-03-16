import { useNavigate, useLocation } from 'react-router-dom';
import { useCounsellorTraining, getModuleState } from '../../contexts/CounsellorTrainingContext';
import TrainingProgressBar from './TrainingProgressBar';
import TrainingModuleItem from './TrainingModuleItem';

export default function TrainingSidebar({ onCloseSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { modules, totalModules, completedModules, currentModule, setCurrentModule } = useCounsellorTraining();

  const handleModuleClick = (moduleId) => {
    setCurrentModule(moduleId);
    const isTrainingPage = location.pathname === '/counsellor/training';
    if (isTrainingPage) {
      navigate(`/counsellor/training?module=${moduleId}`, { replace: true });
    } else {
      navigate(`/counsellor/training?module=${moduleId}`);
    }
    const main = document.getElementById('main-content');
    if (main) main.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-0 flex-1 max-h-[280px]">
      <p className="px-3 mb-2 text-[0.6875rem] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
        Counsellor Training
      </p>
      <div className="flex gap-2 min-h-0 flex-1 overflow-hidden">
        <div className="flex flex-col self-stretch shrink-0 w-6">
          <TrainingProgressBar
            modules={modules}
            completedModules={completedModules}
            currentModule={currentModule}
          />
        </div>
        <div className="flex-1 min-w-0 overflow-y-auto space-y-0.5 py-0.5">
          {modules.map((mod) => {
            const state = getModuleState(mod.id, completedModules);
            const isCurrent = currentModule === mod.id;
            return (
              <TrainingModuleItem
                key={mod.id}
                module={mod}
                state={state}
                isCurrent={isCurrent}
                onClick={handleModuleClick}
                onCloseSidebar={onCloseSidebar}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 px-3">
        <p className="text-[0.6875rem] font-semibold text-slate-500 uppercase tracking-wider">
          Training Progress
        </p>
        <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
          {completedModules.length} / {totalModules} Modules Completed
        </p>
      </div>
    </div>
  );
}
