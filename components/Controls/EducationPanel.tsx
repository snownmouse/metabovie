import React from 'react';
import { Pathway } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  pathway: Pathway;
  currentStep: number;
  onStepChange: (step: number) => void;
}

const EducationPanel: React.FC<Props> = ({ pathway, currentStep, onStepChange }) => {
  const { t, language } = useLanguage();
  const currentLink = pathway.links[currentStep];
  const totalSteps = pathway.links.length;

  // Find associated nodes for context
  const sourceNode = pathway.nodes.find(n => n.id === currentLink?.source);
  const targetNode = pathway.nodes.find(n => n.id === currentLink?.target);
  
  const enzymeName = currentLink?.enzyme ? currentLink.enzyme[language] : 'Enzyme';

  return (
    <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 bg-white/95 backdrop-blur-md p-5 rounded-xl shadow-xl border-l-4 border-amber-400">
      <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center">
        <i className="fas fa-graduation-cap text-amber-500 mr-2"></i>
        {t('panel.education')}
      </h3>

      {currentLink ? (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wide mb-1">
            <span>Step {currentStep + 1} / {totalSteps}</span>
            <span className="font-mono bg-slate-100 px-1 rounded">{enzymeName}</span>
          </div>
          <div className="text-lg font-bold text-slate-800 mb-1">
             {sourceNode?.name[language]} <i className="fas fa-arrow-right text-slate-400 mx-1"></i> {targetNode?.name[language]}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {language === 'en' 
              ? `Reaction catalyzed by ${enzymeName}. Transforming ${sourceNode?.name.en} into ${targetNode?.name.en}.`
              : `由 ${enzymeName} 催化的反应。将 ${sourceNode?.name.zh} 转化为 ${targetNode?.name.zh}。`}
          </p>
        </div>
      ) : (
        <div className="p-4 text-center text-slate-500">End of Pathway</div>
      )}

      <div className="flex justify-between space-x-3">
        <button
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex-1 py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium disabled:opacity-50 transition-colors"
        >
          <i className="fas fa-chevron-left mr-2"></i> {t('step.prev')}
        </button>
        <button
          onClick={() => onStepChange(Math.min(totalSteps - 1, currentStep + 1))}
          disabled={currentStep === totalSteps - 1}
          className="flex-1 py-2 px-4 rounded-lg bg-science-600 hover:bg-science-700 text-white text-sm font-medium shadow-md shadow-science-200 disabled:opacity-50 transition-colors"
        >
          {t('step.next')} <i className="fas fa-chevron-right ml-2"></i>
        </button>
      </div>
    </div>
  );
};

export default EducationPanel;