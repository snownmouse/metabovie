
import React, { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import PathwayGraph from './components/Visualization/PathwayGraph';
import SimulationPanel from './components/Controls/SimulationPanel';
import EducationPanel from './components/Controls/EducationPanel';
import { fetchPathway, fetchCategory, applySimulation } from './services/dataService';
import { AppMode, Pathway, PhysioState, PathwayCategory } from './types';

const AppContent: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  
  const [activeId, setActiveId] = useState<string>('glycolysis');
  const [activeType, setActiveType] = useState<'pathway' | 'category'>('pathway');
  
  const [mode, setMode] = useState<AppMode>(AppMode.RESEARCH);
  const [physioState, setPhysioState] = useState<PhysioState>(PhysioState.NORMAL);
  const [rawData, setRawData] = useState<Pathway | null>(null);
  const [displayData, setDisplayData] = useState<Pathway | null>(null);
  const [educationStep, setEducationStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Quiz Mode State
  const [quizConfig, setQuizConfig] = useState({ hideMetabolites: false, hideEnzymes: false });

  useEffect(() => {
    setLoading(true);
    const loadPromise = activeType === 'pathway' 
      ? fetchPathway(activeId) 
      : fetchCategory(activeId as PathwayCategory);

    loadPromise.then(data => {
      setRawData(data);
      setDisplayData(data);
      setEducationStep(0);
      setLoading(false);
    });
  }, [activeId, activeType]);

  useEffect(() => {
    if (!rawData) return;
    if (mode === AppMode.RESEARCH) {
      const simulated = applySimulation(rawData, physioState);
      setDisplayData(simulated);
    } else {
      setDisplayData(rawData);
    }
  }, [rawData, physioState, mode]);

  const handleNavClick = (id: string, type: 'pathway' | 'category') => {
    setActiveId(id);
    setActiveType(type);
  };

  const toggleQuizOption = (key: 'hideMetabolites' | 'hideEnzymes') => {
    setQuizConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const categories = [
    { 
      id: PathwayCategory.INTEGRATION,
      icon: 'fa-project-diagram',
      pathways: [] 
    },
    { 
      id: PathwayCategory.CARBOHYDRATE, 
      icon: 'fa-bread-slice', 
      pathways: ['glycolysis', 'tca', 'ppp', 'glycogen'] 
    },
    { 
      id: PathwayCategory.ENERGY, 
      icon: 'fa-bolt', 
      pathways: ['oxphos'] 
    },
    { 
      id: PathwayCategory.LIPID, 
      icon: 'fa-oil-can', 
      pathways: ['lipid'] // Consolidated view
    },
    { 
      id: PathwayCategory.AMINO_ACID, 
      icon: 'fa-drumstick-bite', 
      pathways: ['amino_acid'] // Consolidated view
    },
    { 
      id: PathwayCategory.NUCLEOTIDE, 
      icon: 'fa-dna', 
      pathways: ['nucleotide'] // Consolidated view
    },
    {
      id: PathwayCategory.HEME,
      icon: 'fa-droplet',
      pathways: ['heme']
    }
  ];

  return (
    <div className="flex h-screen w-screen bg-slate-100 text-slate-800 font-sans">
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 transition-all">
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <h1 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-science-400 to-science-600 rounded-lg flex items-center justify-center shadow-lg shadow-science-500/30">
              <i className="fas fa-network-wired text-white text-sm"></i>
            </div>
            MetaboViz
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-11">System Biology Platform</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {categories.map(cat => (
            <div key={cat.id}>
              <button 
                 onClick={() => handleNavClick(cat.id, 'category')}
                 className={`w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2 px-3 py-2 rounded transition-colors group
                   ${activeId === cat.id && activeType === 'category' ? 'bg-slate-800 text-science-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <span className="flex items-center">
                  <i className={`fas ${cat.icon} mr-2 w-4`}></i>
                  {t(`cat.${cat.id}`)}
                </span>
                {activeId === cat.id && activeType === 'category' && <span className="text-[10px] bg-science-900 text-science-400 px-1.5 py-0.5 rounded border border-science-800">VIEW</span>}
              </button>

              <div className="space-y-1 ml-2 pl-3 border-l border-slate-800">
                {cat.pathways.map(pid => (
                  <button
                    key={pid}
                    onClick={() => handleNavClick(pid, 'pathway')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center
                      ${activeId === pid && activeType === 'pathway'
                        ? 'bg-science-600 text-white shadow-lg shadow-science-900/50 translate-x-1' 
                        : 'hover:bg-slate-800 hover:text-white'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-3 ${activeId === pid ? 'bg-white' : 'bg-slate-600'}`}></span>
                    {t(`nav.${pid}`)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between bg-slate-800 rounded-lg p-1">
             <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 text-xs py-1.5 rounded font-medium transition-all ${language === 'en' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >English</button>
             <button 
                onClick={() => setLanguage('zh')}
                className={`flex-1 text-xs py-1.5 rounded font-medium transition-all ${language === 'zh' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >中文</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative h-full">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center text-xs text-slate-400 mb-0.5 space-x-1">
                 <span className="uppercase">{activeType === 'category' ? t('view.module') : t('view.single')}</span>
                 {activeType === 'pathway' && activeId && (
                   <>
                    <i className="fas fa-chevron-right text-[10px]"></i>
                    <span>{rawData ? t(`cat.${rawData.category}`) : ''}</span>
                   </>
                 )}
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
                {rawData ? rawData.name[language] : 'Loading...'}
              </h2>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setMode(AppMode.RESEARCH)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${mode === AppMode.RESEARCH ? 'bg-white text-science-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <i className="fas fa-microscope"></i>
                {t('mode.research')}
              </button>
              <button
                onClick={() => setMode(AppMode.EDUCATION)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${mode === AppMode.EDUCATION ? 'bg-white text-amber-500 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <i className="fas fa-graduation-cap"></i>
                {t('mode.education')}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {mode === AppMode.EDUCATION && (
               <div className="flex items-center bg-amber-50 border border-amber-200 rounded-lg p-1 mr-2">
                 <span className="text-[10px] text-amber-600 font-bold px-2 uppercase">{t('quiz.title')}</span>
                 <button 
                   onClick={() => toggleQuizOption('hideMetabolites')}
                   className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${quizConfig.hideMetabolites ? 'bg-amber-400 text-white shadow-sm' : 'text-amber-600 hover:bg-amber-100'}`}
                   title={t('quiz.hide_metabolites')}
                 >
                   <i className={`fas ${quizConfig.hideMetabolites ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                   Nodes
                 </button>
                 <button 
                   onClick={() => toggleQuizOption('hideEnzymes')}
                   className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${quizConfig.hideEnzymes ? 'bg-amber-400 text-white shadow-sm' : 'text-amber-600 hover:bg-amber-100'}`}
                   title={t('quiz.hide_enzymes')}
                 >
                   <i className={`fas ${quizConfig.hideEnzymes ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                   Enzymes
                 </button>
               </div>
             )}
             <button className="text-slate-400 hover:text-science-600 transition-colors" title="Export Image"><i className="fas fa-camera"></i></button>
          </div>
        </header>

        <div className="flex-1 relative bg-slate-50 overflow-hidden cursor-crosshair">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          {loading || !displayData ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-pulse">
                <i className="fas fa-circle-notch fa-spin text-3xl text-science-300 mb-4"></i>
                <span className="font-medium">Building Metabolic Network...</span>
             </div>
          ) : (
            <PathwayGraph 
              data={displayData} 
              language={language}
              highlightStep={mode === AppMode.EDUCATION ? educationStep : undefined}
              isEducationMode={mode === AppMode.EDUCATION}
              quizConfig={mode === AppMode.EDUCATION ? quizConfig : undefined}
            />
          )}
          {!loading && displayData && (
            <>
              {mode === AppMode.RESEARCH && (
                <SimulationPanel currentState={physioState} onChange={setPhysioState} />
              )}
              {mode === AppMode.EDUCATION && (
                <EducationPanel 
                  pathway={displayData}
                  currentStep={educationStep}
                  onStepChange={setEducationStep}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;
