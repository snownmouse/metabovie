
import React, { createContext, useContext, useState } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  'app.title': { en: 'MetaboViz', zh: 'MetaboViz 代谢视界' },
  'mode.research': { en: 'Research', zh: '科研模式' },
  'mode.education': { en: 'Education', zh: '教学模式' },
  
  // Quiz Mode
  'quiz.title': { en: 'Recitation Tools', zh: '背诵辅助' },
  'quiz.hide_metabolites': { en: 'Hide Metabolites', zh: '隐藏代谢物' },
  'quiz.hide_enzymes': { en: 'Hide Enzymes', zh: '隐藏酶名称' },
  
  // States
  'state.normal': { en: 'Normal State', zh: '正常生理状态' },
  'state.starvation': { en: 'Starvation', zh: '饥饿状态' },
  'state.fed': { en: 'Fed State', zh: '饱食状态' },
  'state.exercise': { en: 'Exercise', zh: '运动状态' },
  'state.diabetes': { en: 'Diabetes', zh: '糖尿病' },

  // Navigation Categories
  'cat.carbohydrate': { en: 'Carbohydrate', zh: '碳水化合物' },
  'cat.energy': { en: 'Energy/Bioenergetics', zh: '生物氧化/能量' },
  'cat.lipid': { en: 'Lipid', zh: '脂质' },
  'cat.amino_acid': { en: 'Amino Acid', zh: '氨基酸' },
  'cat.nucleotide': { en: 'Nucleotide', zh: '核苷酸' },
  'cat.heme': { en: 'Heme', zh: '血红素' },
  'cat.integration': { en: 'Full Map', zh: '全景整合' },
  
  // Navigation Pathways
  'nav.glycolysis': { en: 'Glycolysis & GNG', zh: '糖酵解 & 糖异生' }, 
  'nav.glycogen': { en: 'Glycogen', zh: '糖原代谢' },
  'nav.ppp': { en: 'Pentose Phosphate', zh: '磷酸戊糖途径' },
  'nav.tca': { en: 'TCA Cycle', zh: '三羧酸循环' },
  'nav.oxphos': { en: 'Oxidative Phos.', zh: '氧化磷酸化' },
  'nav.lipid': { en: 'Fatty Acid & Chol.', zh: '脂肪酸与胆固醇' },
  'nav.amino_acid': { en: 'Urea & Catabolism', zh: '尿素与氨基酸分解' },
  'nav.nucleotide': { en: 'Purine & Pyrimidine', zh: '嘌呤与嘧啶' },
  'nav.heme': { en: 'Heme Synthesis', zh: '血红素合成' },

  'panel.simulation': { en: 'Physiological State', zh: '生理状态模拟' },
  'panel.education': { en: 'Learning Guide', zh: '学习向导' },
  'step.prev': { en: 'Prev Step', zh: '上一步' },
  'step.next': { en: 'Next Step', zh: '下一步' },
  'flux.legend': { en: 'Metabolic Flux', zh: '代谢通量' },
  
  'view.module': { en: 'Module', zh: '模块视图' },
  'view.single': { en: 'Pathway', zh: '单通路' },

  'compartment.mitochondria': { en: 'Mitochondria', zh: '线粒体' },
  'compartment.cytosol': { en: 'Cytosol', zh: '细胞质基质' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh'); 

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
