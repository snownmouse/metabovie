import React from 'react';
import { PhysioState } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  currentState: PhysioState;
  onChange: (state: PhysioState) => void;
}

const SimulationPanel: React.FC<Props> = ({ currentState, onChange }) => {
  const { t } = useLanguage();

  const getStateIcon = (state: PhysioState) => {
    switch(state) {
      case PhysioState.NORMAL: return 'fa-scale-balanced';
      case PhysioState.STARVATION: return 'fa-battery-empty';
      case PhysioState.FED: return 'fa-utensils';
      case PhysioState.EXERCISE: return 'fa-running';
      case PhysioState.DIABETES: return 'fa-syringe';
      default: return 'fa-flask';
    }
  };

  return (
    <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-200 w-72 transition-all hover:shadow-2xl z-30">
      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
        <i className="fas fa-sliders text-teal-500 mr-2"></i>
        {t('panel.simulation')}
      </h3>
      
      <div className="space-y-2">
        {Object.values(PhysioState).map((state) => (
          <button
            key={state}
            onClick={() => onChange(state)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex justify-between items-center group
              ${currentState === state 
                ? 'bg-science-100 text-science-800 font-semibold border border-science-500' 
                : 'hover:bg-slate-100 text-slate-600 border border-transparent'}`}
          >
            <div className="flex items-center">
               <div className={`w-6 flex justify-center mr-2 ${currentState === state ? 'text-science-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                 <i className={`fas ${getStateIcon(state)}`}></i>
               </div>
               <span>{t(`state.${state}`)}</span>
            </div>
            {currentState === state && <i className="fas fa-check text-science-600"></i>}
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 mb-2 font-medium flex justify-between">
          <span>{t('flux.legend')}</span>
          <span className="text-[10px] bg-slate-100 px-1 rounded">Visual Key</span>
        </div>
        <div className="flex items-center space-x-2">
           <div className="h-1 w-6 bg-red-400 rounded"></div>
           <span className="text-[10px] text-slate-400">Inhibited</span>
           <div className="flex-1"></div>
           <div className="h-2 w-8 bg-science-500 rounded"></div>
           <span className="text-[10px] text-slate-400">Active</span>
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;