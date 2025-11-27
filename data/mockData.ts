
import { Pathway, NodeType, PhysioState, SimulationRule, PathwayCategory } from '../types';

// Helper to create bilingual objects
const enz = (en: string, zh: string) => ({ en, zh });
const exam = (en: string, zh: string) => ({ en, zh });

// --- 1. CARBOHYDRATE METABOLISM ---

export const GLYCOLYSIS: Pathway = {
  id: 'glycolysis',
  category: PathwayCategory.CARBOHYDRATE,
  name: { en: 'Glycolysis', zh: '糖酵解' },
  description: { en: 'Glucose breakdown', zh: '葡萄糖分解' },
  nodes: [
    // CYTOSOL
    { id: 'glucose', name: { en: 'Glucose', zh: '葡萄糖' }, type: NodeType.METABOLITE, fx: 200, fy: 100, formula: "C6H12O6", compartment: 'cytosol' },
    { id: 'g6p', name: { en: 'G6P', zh: '葡萄糖-6-磷酸' }, type: NodeType.METABOLITE, fx: 200, fy: 180, formula: "C6H13O9P", compartment: 'cytosol' },
    { id: 'f6p', name: { en: 'F6P', zh: '果糖-6-磷酸' }, type: NodeType.METABOLITE, fx: 200, fy: 260, formula: "C6H13O9P", compartment: 'cytosol' },
    { id: 'f16bp', name: { en: 'F1,6BP', zh: '果糖-1,6-二磷酸' }, type: NodeType.METABOLITE, fx: 200, fy: 340, formula: "C6H14O12P2", compartment: 'cytosol' },
    { id: 'g3p', name: { en: 'G3P', zh: '甘油醛-3-磷酸' }, type: NodeType.METABOLITE, fx: 150, fy: 420, formula: "C3H7O6P", compartment: 'cytosol' },
    { id: 'dhap', name: { en: 'DHAP', zh: '二羟丙酮磷酸' }, type: NodeType.METABOLITE, fx: 250, fy: 420, formula: "C3H7O6P", compartment: 'cytosol' },
    { id: '13bpg', name: { en: '1,3-BPG', zh: '1,3-二磷酸甘油酸' }, type: NodeType.METABOLITE, fx: 200, fy: 500, formula: "C3H8O10P2", compartment: 'cytosol' },
    { id: '3pg', name: { en: '3PG', zh: '3-磷酸甘油酸' }, type: NodeType.METABOLITE, fx: 200, fy: 580, formula: "C3H7O7P", compartment: 'cytosol' },
    { id: '2pg', name: { en: '2PG', zh: '2-磷酸甘油酸' }, type: NodeType.METABOLITE, fx: 300, fy: 580, formula: "C3H7O7P", compartment: 'cytosol' },
    { id: 'pep', name: { en: 'PEP', zh: '磷酸烯醇式丙酮酸' }, type: NodeType.METABOLITE, fx: 400, fy: 580, formula: "C3H5O6P", compartment: 'cytosol' },
    { id: 'pyruvate', name: { en: 'Pyruvate', zh: '丙酮酸' }, type: NodeType.METABOLITE, fx: 500, fy: 580, formula: "C3H4O3", compartment: 'cytosol' },
    { id: 'lactate', name: { en: 'Lactate', zh: '乳酸' }, type: NodeType.METABOLITE, fx: 500, fy: 660, formula: "C3H6O3", compartment: 'cytosol' },
    
    // GNG Helpers (Mito Bridge)
    { id: 'oxaloacetate_cyto', name: { en: 'OAA (Cyto)', zh: '草酰乙酸(胞)' }, type: NodeType.METABOLITE, fx: 450, fy: 500, compartment: 'cytosol' },
    // MITOCHONDRIA Bridge
    { id: 'pyruvate_mito', name: { en: 'Pyruvate(M)', zh: '丙酮酸(线)' }, type: NodeType.METABOLITE, fx: 750, fy: 580, compartment: 'mitochondria' },
  ],
  links: [
    { 
      id: 'gly_1', source: 'glucose', target: 'g6p', isReversible: false, flux: 1, enzyme: enz('Hexokinase', '己糖激酶'), enzymeReverse: enz('G6Pase', '葡萄糖-6-磷酸酶'), isActive: true,
      examPoint: exam(
        "HK: High affinity (low Km), inhibited by G6P. Glucokinase (Liver): Low affinity (high Km), induced by Insulin.", 
        "考点：己糖激酶(HK) Km小，亲和力大，受G6P反馈抑制；葡萄糖激酶(GK) Km大，专一性差，受胰岛素诱导，不受G6P抑制。"
      ),
      isRateLimiting: true
    },
    { id: 'gly_2', source: 'g6p', target: 'f6p', isReversible: true, flux: 1, enzyme: enz('PGI', '磷酸葡萄糖异构酶'), isActive: true },
    { 
      id: 'gly_3', source: 'f6p', target: 'f16bp', isReversible: false, flux: 1, enzyme: enz('PFK-1', '磷酸果糖激酶-1'), enzymeReverse: enz('FBPase-1', '果糖二磷酸酶-1'), isActive: true,
      examPoint: exam(
        "Major Control Point! Activators: F-2,6-BP (Strongest), AMP. Inhibitors: ATP, Citrate, H+.", 
        "考点：最关键限速酶！最强激活剂是F-2,6-BP（受胰岛素/胰高血糖素双重调节）。抑制剂：ATP、柠檬酸、H+（防止酸中毒）。"
      ),
      isRateLimiting: true
    },
    { id: 'gly_4', source: 'f16bp', target: 'g3p', isReversible: true, flux: 0.5, enzyme: enz('Aldolase', '醛缩酶'), isActive: true },
    { id: 'gly_5', source: 'f16bp', target: 'dhap', isReversible: true, flux: 0.5, enzyme: enz('Aldolase', '醛缩酶'), isActive: true },
    { id: 'gly_6', source: 'dhap', target: 'g3p', isReversible: true, flux: 1, enzyme: enz('TPI', '磷酸丙糖异构酶'), isActive: true },
    { 
      id: 'gly_7', source: 'g3p', target: '13bpg', isReversible: true, flux: 1, enzyme: enz('GAPDH', '3-磷酸甘油醛脱氢酶'), isActive: true,
      examPoint: exam(
        "Inhibited by Iodoacetate (binds -SH group). Produces NADH.", 
        "考点：巯基酶，受碘乙酸或对氯汞苯甲酸不可逆抑制。产生NADH（无氧时需消耗）。"
      )
    },
    { id: 'gly_8', source: '13bpg', target: '3pg', isReversible: true, flux: 1, enzyme: enz('PGK', '磷酸甘油酸激酶'), isActive: true, examPoint: exam("Substrate-level phosphorylation (ATP). Reversible kinase!", "考点：底物水平磷酸化生成ATP。注意：虽然叫激酶，但是是可逆反应。") },
    { id: 'gly_9', source: '3pg', target: '2pg', isReversible: true, flux: 1, enzyme: enz('PGM', '磷酸甘油酸变位酶'), isActive: true },
    { 
      id: 'gly_10', source: '2pg', target: 'pep', isReversible: true, flux: 1, enzyme: enz('Enolase', '烯醇化酶'), isActive: true,
      examPoint: exam("Inhibited by Fluoride (F-). Used in blood glucose testing tubes.", "考点：受氟化物（F-）抑制。血糖检测采血管中常加氟化钠以抑制糖酵解。") 
    },
    { 
      id: 'gly_11', source: 'pep', target: 'pyruvate', isReversible: false, flux: 1, enzyme: enz('Pyruvate Kinase', '丙酮酸激酶'), isActive: true,
      examPoint: exam(
        "Irreversible. Feed-forward activation by F-1,6-BP. Inhibited by ATP, Alanine.", 
        "考点：受前身物 F-1,6-BP 前馈激活。受 ATP、丙氨酸、乙酰CoA 变构抑制。磷酸化/去磷酸化调节（肝脏）。"
      ),
      isRateLimiting: true
    },
    { id: 'gly_lac', source: 'pyruvate', target: 'lactate', isReversible: true, flux: 1, enzyme: enz('LDH', '乳酸脱氢酶'), isActive: true, examPoint: exam("Isoenzymes: LDH1 (Heart) vs LDH5 (Muscle). Cori Cycle connection.", "考点：同工酶谱（LDH1心肌，LDH5骨骼肌）。无氧糖酵解的终点，再生NAD+供GAPDH使用。") },
    
    // Transport
    { id: 'pyruvate_transport', source: 'pyruvate', target: 'pyruvate_mito', isReversible: false, flux: 1, enzyme: enz('Transporter', '转运体'), isActive: true },

    // Gluconeogenesis bypass
    { id: 'gng_2', source: 'oxaloacetate_cyto', target: 'pep', isReversible: false, flux: 0.2, enzyme: enz('PEPCK', '磷酸烯醇式丙酮酸羧激酶'), isActive: true, examPoint: exam("GNG Key enzyme. Induced by Glucagon/Cortisol. Consumes GTP.", "考点：糖异生关键酶。消耗GTP。受胰高血糖素、糖皮质激素诱导。"), isRateLimiting: true }
  ]
};

export const TCA_CYCLE: Pathway = {
  id: 'tca',
  category: PathwayCategory.CARBOHYDRATE,
  name: { en: 'TCA Cycle', zh: '三羧酸循环' },
  description: { en: 'Krebs Cycle', zh: '克雷布斯循环' },
  nodes: [
    // MITOCHONDRIA AREA
    { id: 'pyruvate_mito', name: { en: 'Pyruvate', zh: '丙酮酸' }, type: NodeType.METABOLITE, fx: 750, fy: 580, compartment: 'mitochondria' },
    { id: 'acetyl_coa', name: { en: 'Acetyl-CoA', zh: '乙酰辅酶A' }, type: NodeType.METABOLITE, fx: 850, fy: 500, compartment: 'mitochondria' },
    { id: 'oxaloacetate', name: { en: 'OAA', zh: '草酰乙酸' }, type: NodeType.METABOLITE, fx: 850, fy: 400, compartment: 'mitochondria' },
    { id: 'citrate', name: { en: 'Citrate', zh: '柠檬酸' }, type: NodeType.METABOLITE, fx: 950, fy: 400, compartment: 'mitochondria' },
    { id: 'isocitrate', name: { en: 'Isocitrate', zh: '异柠檬酸' }, type: NodeType.METABOLITE, fx: 1050, fy: 400, compartment: 'mitochondria' },
    { id: 'alpha_kg', name: { en: 'α-KG', zh: 'α-酮戊二酸' }, type: NodeType.METABOLITE, fx: 1100, fy: 500, compartment: 'mitochondria' },
    { id: 'succinyl_coa', name: { en: 'Succinyl-CoA', zh: '琥珀酰CoA' }, type: NodeType.METABOLITE, fx: 1050, fy: 600, compartment: 'mitochondria' },
    { id: 'succinate', name: { en: 'Succinate', zh: '琥珀酸' }, type: NodeType.METABOLITE, fx: 950, fy: 600, compartment: 'mitochondria' },
    { id: 'fumarate', name: { en: 'Fumarate', zh: '延胡索酸' }, type: NodeType.METABOLITE, fx: 850, fy: 600, compartment: 'mitochondria' },
    { id: 'malate', name: { en: 'Malate', zh: '苹果酸' }, type: NodeType.METABOLITE, fx: 750, fy: 500, compartment: 'mitochondria' },
  ],
  links: [
    { 
      id: 'pdh', source: 'pyruvate_mito', target: 'acetyl_coa', isReversible: false, flux: 1, enzyme: enz('PDH Complex', '丙酮酸脱氢酶复合体'), isActive: true,
      examPoint: exam(
        "Needs 5 Cofactors: TPP, FAD, NAD+, CoA, Lipoamide. Inhibited by Acetyl-CoA/NADH. Inhibited by phosphorylation (PDK).", 
        "考点：需要5种辅酶（TPP, FAD, NAD+, CoA, 硫辛酸）。受产物（乙酰CoA, NADH）抑制。受磷酸化修饰抑制（PDH激酶）。"
      ),
      isRateLimiting: true
    },
    { 
      id: 'cs', source: 'acetyl_coa', target: 'citrate', isReversible: false, flux: 1, enzyme: enz('Citrate Synthase', '柠檬酸合酶'), isActive: true, 
      isRateLimiting: true,
      examPoint: exam("Inhibited by ATP, NADH, Succinyl-CoA, Citrate.", "考点：受ATP、NADH、琥珀酰CoA、长链脂酰CoA抑制。")
    },
    { id: 'cs_link', source: 'oxaloacetate', target: 'citrate', isReversible: false, flux: 1, isActive: true },
    { id: 'tca_1', source: 'citrate', target: 'isocitrate', isReversible: true, flux: 1, enzyme: enz('Aconitase', '顺乌头酸酶'), isActive: true, examPoint: exam("Contains Fe-S center. Inhibited by Fluoroacetate (Rat poison).", "考点：含铁硫中心。受氟乙酸（杀鼠药）抑制，导致柠檬酸堆积。") },
    { 
      id: 'tca_2', source: 'isocitrate', target: 'alpha_kg', isReversible: false, flux: 1, enzyme: enz('IDH', '异柠檬酸脱氢酶'), isActive: true,
      examPoint: exam("Key Rate-limiting step! Activated by ADP/Ca2+. Inhibited by ATP/NADH.", "考点：关键限速酶！受ADP、Ca2+变构激活；受ATP、NADH抑制。"),
      isRateLimiting: true
    },
    { 
      id: 'tca_3', source: 'alpha_kg', target: 'succinyl_coa', isReversible: false, flux: 1, enzyme: enz('KGDH', 'α-酮戊二酸脱氢酶'), isActive: true, 
      examPoint: exam("Similar mechanism to PDH (5 cofactors). Inhibited by Succinyl-CoA/NADH. Arsenite poisoning target.", "考点：机制同PDH，同样需要5种辅酶。砷化物中毒的靶点之一（结合硫辛酸）。"), 
      isRateLimiting: true 
    },
    { id: 'tca_4', source: 'succinyl_coa', target: 'succinate', isReversible: true, flux: 1, enzyme: enz('Succ-CoA Syn', '琥珀酰CoA合成酶'), isActive: true, examPoint: exam("Only Substrate-Level Phosphorylation in TCA (GTP).", "考点：TCA循环中唯一的底物水平磷酸化（生成GTP）。") },
    { 
      id: 'tca_5', source: 'succinate', target: 'fumarate', isReversible: true, flux: 1, enzyme: enz('SDH', '琥珀酸脱氢酶'), isActive: true, 
      examPoint: exam("Complex II of ETC. Inner Membrane bound. FAD cofactor. Competitively inhibited by Malonate.", "考点：唯一结合在线粒体内膜的酶（ETC复合物II）。辅酶是FAD。受丙二酸竞争性抑制。") 
    },
    { id: 'tca_6', source: 'fumarate', target: 'malate', isReversible: true, flux: 1, enzyme: enz('Fumarase', '延胡索酸酶'), isActive: true },
    { id: 'tca_7', source: 'malate', target: 'oxaloacetate', isReversible: true, flux: 1, enzyme: enz('MDH', '苹果酸脱氢酶'), isActive: true, examPoint: exam("Produces NADH. Standard free energy is positive, driven by consumption of OAA.", "考点：生成NADH。反应ΔG>0，靠消耗草酰乙酸拉动反应进行。") }
  ]
};

export const PPP: Pathway = {
  id: 'ppp',
  category: PathwayCategory.CARBOHYDRATE,
  name: { en: 'Pentose Phosphate', zh: '磷酸戊糖途径' },
  description: { en: 'NADPH & Ribose', zh: 'NADPH与核糖生成' },
  nodes: [
    // CYTOSOL
    { id: 'g6p', name: { en: 'G6P', zh: '葡萄糖-6-磷酸' }, type: NodeType.METABOLITE, fx: 200, fy: 180, compartment: 'cytosol' },
    { id: '6pg', name: { en: '6-PG', zh: '6-磷酸葡萄糖酸' }, type: NodeType.METABOLITE, fx: 300, fy: 180, compartment: 'cytosol' },
    { id: 'ru5p', name: { en: 'Ru5P', zh: '核酮糖-5-磷酸' }, type: NodeType.METABOLITE, fx: 400, fy: 180, compartment: 'cytosol' },
    { id: 'ribose5p', name: { en: 'R5P', zh: '核糖-5-磷酸' }, type: NodeType.METABOLITE, fx: 500, fy: 180, compartment: 'cytosol' },
    { id: 'xylulose5p', name: { en: 'Xu5P', zh: '木酮糖-5-磷酸' }, type: NodeType.METABOLITE, fx: 400, fy: 250, compartment: 'cytosol' },
    { id: 'f6p', name: { en: 'F6P', zh: '果糖-6-磷酸' }, type: NodeType.METABOLITE, fx: 200, fy: 260, compartment: 'cytosol' },
    { id: 'g3p', name: { en: 'G3P', zh: '甘油醛-3-磷酸' }, type: NodeType.METABOLITE, fx: 150, fy: 420, compartment: 'cytosol' }
  ],
  links: [
    { 
      id: 'ppp_1', source: 'g6p', target: '6pg', isReversible: false, flux: 1, enzyme: enz('G6PD', '葡萄糖-6-磷酸脱氢酶'), isActive: true,
      examPoint: exam(
        "Rate-limiting. Inhibited by NADPH. Deficiency causes Favism (Hemolytic Anemia due to low GSH).", 
        "考点：限速酶。受NADPH/NADP+比值调节。缺乏会导致蚕豆病（NADPH不足，谷胱甘肽无法还原，红细胞溶血）。"
      ),
      isRateLimiting: true
    },
    { id: 'ppp_2', source: '6pg', target: 'ru5p', isReversible: false, flux: 1, enzyme: enz('6PGD', '6-磷酸葡萄糖酸脱氢酶'), isActive: true, examPoint: exam("Produces 2nd NADPH and CO2.", "考点：生成第二个NADPH和CO2。") },
    { id: 'ppp_3', source: 'ru5p', target: 'ribose5p', isReversible: true, flux: 1, enzyme: enz('Isomerase', '异构酶'), isActive: true, examPoint: exam("Precursor for Nucleotide Synthesis (PRPP).", "考点：生成核糖，用于核苷酸合成（PRPP）。") },
    { id: 'ppp_4', source: 'ru5p', target: 'xylulose5p', isReversible: true, flux: 1, enzyme: enz('Epimerase', '差向异构酶'), isActive: true },
    { id: 'ppp_5', source: 'ribose5p', target: 'f6p', isReversible: true, flux: 1, enzyme: enz('Transketolase', '转酮醇酶'), isActive: true, examPoint: exam("Requires TPP (Vitamin B1). Used to diagnose B1 deficiency.", "考点：需要TPP（维生素B1）作为辅酶。测定红细胞转酮醇酶活性可诊断B1缺乏。") },
    { id: 'ppp_6', source: 'xylulose5p', target: 'g3p', isReversible: true, flux: 1, enzyme: enz('Transaldolase', '转醛醇酶'), isActive: true }
  ]
};

export const GLYCOGEN: Pathway = {
  id: 'glycogen',
  category: PathwayCategory.CARBOHYDRATE,
  name: { en: 'Glycogen', zh: '糖原代谢' },
  description: { en: 'Storage', zh: '储存' },
  nodes: [
    // CYTOSOL (Top Left)
    { id: 'glycogen', name: { en: 'Glycogen', zh: '糖原' }, type: NodeType.METABOLITE, fx: 50, fy: 100, compartment: 'cytosol' },
    { id: 'g1p', name: { en: 'G1P', zh: '葡萄糖-1-磷酸' }, type: NodeType.METABOLITE, fx: 120, fy: 100, compartment: 'cytosol' },
    { id: 'g6p', name: { en: 'G6P', zh: '葡萄糖-6-磷酸' }, type: NodeType.METABOLITE, fx: 200, fy: 180, compartment: 'cytosol' }, // Shared
    { id: 'udp_glucose', name: { en: 'UDP-Glc', zh: 'UDP-葡萄糖' }, type: NodeType.METABOLITE, fx: 120, fy: 50, compartment: 'cytosol' }
  ],
  links: [
    { 
      id: 'gly_deg', source: 'glycogen', target: 'g1p', isReversible: false, flux: 1, enzyme: enz('Glycogen Phosphorylase', '糖原磷酸化酶'), isActive: true,
      examPoint: exam(
        "Key Enzyme for breakdown. Active when phosphorylated (Glucagon/Epinephrine). Cofactor: PLP.", 
        "考点：分解限速酶。磷酸化状态有活性（受胰高血糖素/肾上腺素诱导）。辅酶是PLP（维生素B6）。"
      ),
      isRateLimiting: true
    },
    { id: 'gly_mut', source: 'g1p', target: 'g6p', isReversible: true, flux: 1, enzyme: enz('Phosphoglucomutase', '磷酸葡萄糖变位酶'), isActive: true },
    { id: 'gly_udp', source: 'g1p', target: 'udp_glucose', isReversible: false, flux: 1, enzyme: enz('UDPG-PP', 'UDPG焦磷酸化酶'), isActive: true },
    { 
      id: 'gly_syn', source: 'udp_glucose', target: 'glycogen', isReversible: false, flux: 1, enzyme: enz('Glycogen Synthase', '糖原合酶'), isActive: true,
      examPoint: exam(
        "Key Enzyme for synthesis. Active when DE-phosphorylated (Insulin).", 
        "考点：合成限速酶。去磷酸化状态有活性（受胰岛素激活）。"
      ),
      isRateLimiting: true
    }
  ]
};

// --- 2. ENERGY ---

export const OXPHOS: Pathway = {
  id: 'oxphos',
  category: PathwayCategory.ENERGY,
  name: { en: 'Oxidative Phos.', zh: '氧化磷酸化' },
  description: { en: 'ETC & ATP', zh: '电子传递链' },
  nodes: [
    // MITOCHONDRIA (Inner Membrane - Visualized inside Mito)
    { id: 'nadh', name: { en: 'NADH', zh: 'NADH' }, type: NodeType.COFACTOR, fx: 1200, fy: 450, compartment: 'mitochondria' },
    { id: 'fadh2', name: { en: 'FADH2', zh: 'FADH2' }, type: NodeType.COFACTOR, fx: 1200, fy: 550, compartment: 'mitochondria' },
    { id: 'oxygen', name: { en: 'O2', zh: '氧气' }, type: NodeType.METABOLITE, fx: 1300, fy: 500, compartment: 'mitochondria' },
    { id: 'water', name: { en: 'H2O', zh: '水' }, type: NodeType.METABOLITE, fx: 1400, fy: 500, compartment: 'mitochondria' },
    { id: 'atp', name: { en: 'ATP', zh: 'ATP' }, type: NodeType.COFACTOR, fx: 1400, fy: 400, compartment: 'mitochondria' }
  ],
  links: [
    { 
      id: 'etc_1', source: 'nadh', target: 'oxygen', isReversible: false, flux: 1, enzyme: enz('Complex I->IV', '复合物 I->IV'), isActive: true, 
      examPoint: exam(
        "NADH P/O ratio ~2.5. Inhibitors: Rotenone(I), Antimycin A(III), CO/CN-(IV). Uncouplers: DNP.", 
        "考点：NADH P/O比值约为2.5。阻断剂：鱼藤酮(I)、抗霉素A(III)、一氧化碳/氰化物(IV)。解偶联剂：二硝基苯酚(DNP)。"
      ) 
    },
    { id: 'etc_2', source: 'fadh2', target: 'oxygen', isReversible: false, flux: 1, enzyme: enz('Complex II->IV', '复合物 II->IV'), isActive: true, examPoint: exam("FADH2 P/O ratio ~1.5. Enters at CoQ.", "考点：FADH2 P/O比值约为1.5。从辅酶Q处进入呼吸链。") },
    { id: 'etc_3', source: 'oxygen', target: 'water', isReversible: false, flux: 1, isActive: true },
    { id: 'etc_atp', source: 'water', target: 'atp', isReversible: false, flux: 1, enzyme: enz('ATP Synthase', 'ATP合酶'), isActive: true, examPoint: exam("Oligomycin inhibits F0 unit.", "考点：寡霉素抑制F0亚基，阻断质子回流。") }
  ]
};

// --- 3. LIPID ---

export const LIPID_METABOLISM: Pathway = {
  id: 'lipid',
  category: PathwayCategory.LIPID,
  name: { en: 'Lipid Metabolism', zh: '脂质代谢' },
  description: { en: 'FA & Cholesterol', zh: '脂肪酸与胆固醇' },
  nodes: [
    // CYTOSOL (Synthesis)
    { id: 'citrate_cyto', name: { en: 'Citrate(C)', zh: '柠檬酸(胞)' }, type: NodeType.METABOLITE, fx: 500, fy: 400, compartment: 'cytosol' },
    { id: 'acetyl_coa_cyto', name: { en: 'Acetyl-CoA(C)', zh: '乙酰CoA(胞)' }, type: NodeType.METABOLITE, fx: 600, fy: 450, compartment: 'cytosol' },
    { id: 'malonyl_coa', name: { en: 'Malonyl-CoA', zh: '丙二酰CoA' }, type: NodeType.METABOLITE, fx: 500, fy: 500, compartment: 'cytosol' },
    { id: 'palmitate', name: { en: 'Palmitate', zh: '软脂酸' }, type: NodeType.METABOLITE, fx: 400, fy: 500, compartment: 'cytosol' },
    { id: 'acyl_coa', name: { en: 'Acyl-CoA', zh: '脂酰CoA' }, type: NodeType.METABOLITE, fx: 300, fy: 500, compartment: 'cytosol' },
    
    // MITOCHONDRIA (Beta Oxidation)
    { id: 'acyl_coa_mito', name: { en: 'Acyl-CoA(M)', zh: '脂酰CoA(线)' }, type: NodeType.METABOLITE, fx: 750, fy: 500, compartment: 'mitochondria' },
    { id: 'acetyl_coa', name: { en: 'Acetyl-CoA', zh: '乙酰辅酶A' }, type: NodeType.METABOLITE, fx: 850, fy: 500, compartment: 'mitochondria' }, // Shared
    
    // Cholesterol (Cytosol)
    { id: 'hmg_coa', name: { en: 'HMG-CoA', zh: 'HMG-CoA' }, type: NodeType.METABOLITE, fx: 600, fy: 350, compartment: 'cytosol' },
    { id: 'mevalonate', name: { en: 'Mevalonate', zh: '甲羟戊酸' }, type: NodeType.METABOLITE, fx: 600, fy: 250, compartment: 'cytosol' },
    { id: 'cholesterol', name: { en: 'Cholesterol', zh: '胆固醇' }, type: NodeType.METABOLITE, fx: 700, fy: 200, compartment: 'cytosol' }
  ],
  links: [
    // FA Synthesis (Cytosol)
    { 
      id: 'fas_citrate', source: 'citrate_cyto', target: 'acetyl_coa_cyto', isReversible: false, flux: 1, enzyme: enz('ACL', 'ATP柠檬酸裂解酶'), isActive: true,
      examPoint: exam("Citrate-Pyruvate Cycle. Transports Acetyl-CoA to Cytosol.", "考点：柠檬酸-丙酮酸循环，将乙酰CoA转运出线粒体。")
    },
    { 
      id: 'fas_1', source: 'acetyl_coa_cyto', target: 'malonyl_coa', isReversible: false, flux: 1, enzyme: enz('ACC', '乙酰CoA羧化酶'), isActive: true,
      examPoint: exam(
        "Key Control! Activated by Citrate, Insulin (dephosphorylation). Inhibited by Palmitoyl-CoA, Glucagon.", 
        "考点：最关键限速酶。柠檬酸促进聚合（激活），长链脂酰CoA促进解聚（抑制）。受生物素（Biotin）辅助。"
      ),
      isRateLimiting: true
    },
    { 
      id: 'fas_2', source: 'malonyl_coa', target: 'palmitate', isReversible: false, flux: 1, enzyme: enz('FAS', '脂肪酸合酶'), isActive: true, 
      examPoint: exam("Multi-enzyme complex. Requires NADPH (from PPP/Malic Enzyme).", "考点：多酶复合体（二聚体）。还原力NADPH来自PPP和苹果酸酶。") 
    },
    
    // Transport / Beta Oxidation
    { 
      id: 'box_0', source: 'palmitate', target: 'acyl_coa', isReversible: true, flux: 1, enzyme: enz('Acyl-CoA Syn', '脂酰CoA合成酶'), isActive: true 
    },
    {
      id: 'cpt_1', source: 'acyl_coa', target: 'acyl_coa_mito', isReversible: false, flux: 1, enzyme: enz('CPT-I', '肉碱棕榈酰转移酶I'), isActive: true,
      examPoint: exam(
        "Rate-limiting step of Beta-Ox. Inhibited by Malonyl-CoA (Prevents futile cycle).", 
        "考点：β-氧化限速步。受丙二酰CoA（合成的中间产物）强烈抑制，防止合成与分解无效循环。"
      ),
      isRateLimiting: true
    },
    { 
      id: 'box_2', source: 'acyl_coa_mito', target: 'acetyl_coa', isReversible: false, flux: 1, enzyme: enz('Beta-Oxidation', 'β-氧化体系'), isActive: true,
      examPoint: exam(
        "4 Steps: Dehydrogenation(FAD), Hydration, Dehydrogenation(NAD+), Thiolysis. Yields Acetyl-CoA.", 
        "考点：四步反应：脱氢(FAD)、加水、再脱氢(NAD+)、硫解。生成乙酰CoA、FADH2、NADH。"
      )
    },
    
    // Cholesterol (Cytosol)
    { id: 'chol_1', source: 'acetyl_coa_cyto', target: 'hmg_coa', isReversible: false, flux: 1, enzyme: enz('HMG-CoA Synthase', 'HMG-CoA合酶'), isActive: true },
    { 
      id: 'chol_2', source: 'hmg_coa', target: 'mevalonate', isReversible: false, flux: 1, enzyme: enz('HMG-CoA Reductase', 'HMG-CoA还原酶'), isActive: true,
      examPoint: exam(
        "Rate-limiting. Inhibited by Cholesterol (Feedback), Statins (Competitive). Diurnal rhythm (Night > Day).", 
        "考点：胆固醇合成限速酶。受胆固醇反馈抑制。他汀类药物是其竞争性抑制剂。具有昼夜节律（夜间活性高）。"
      ),
      isRateLimiting: true
    },
    { id: 'chol_3', source: 'mevalonate', target: 'cholesterol', isReversible: false, flux: 1, enzyme: enz('Multi-step', '多步反应'), isActive: true }
  ]
};

// --- 4. AMINO ACID ---

export const AMINO_ACID: Pathway = {
  id: 'amino_acid',
  category: PathwayCategory.AMINO_ACID,
  name: { en: 'Amino Acid', zh: '氨基酸代谢' },
  description: { en: 'Urea & Catabolism', zh: '尿素循环与分解' },
  nodes: [
    // MITOCHONDRIA
    { id: 'glutamate', name: { en: 'Glu', zh: '谷氨酸' }, type: NodeType.METABOLITE, fx: 950, fy: 300, compartment: 'mitochondria' },
    { id: 'nh4', name: { en: 'NH4+', zh: '氨' }, type: NodeType.METABOLITE, fx: 1050, fy: 250, compartment: 'mitochondria' },
    { id: 'cp', name: { en: 'Carbamoyl-P', zh: '氨甲酰磷酸' }, type: NodeType.METABOLITE, fx: 1150, fy: 250, compartment: 'mitochondria' },
    { id: 'citrulline', name: { en: 'Citrulline', zh: '瓜氨酸' }, type: NodeType.METABOLITE, fx: 1150, fy: 350, compartment: 'mitochondria' },
    
    // CYTOSOL
    { id: 'citrulline_cyto', name: { en: 'Citrulline(C)', zh: '瓜氨酸(胞)' }, type: NodeType.METABOLITE, fx: 600, fy: 100, compartment: 'cytosol' },
    { id: 'arginine', name: { en: 'Arginine', zh: '精氨酸' }, type: NodeType.METABOLITE, fx: 500, fy: 100, compartment: 'cytosol' },
    { id: 'urea', name: { en: 'Urea', zh: '尿素' }, type: NodeType.METABOLITE, fx: 400, fy: 100, compartment: 'cytosol' },
    { id: 'aspartate', name: { en: 'Asp', zh: '天冬氨酸' }, type: NodeType.METABOLITE, fx: 700, fy: 100, compartment: 'cytosol' },
    { id: 'oxaloacetate_aa', name: { en: 'OAA', zh: '草酰乙酸' }, type: NodeType.METABOLITE, fx: 800, fy: 100, compartment: 'cytosol' }
  ],
  links: [
    { 
      id: 'aa_gdh', source: 'glutamate', target: 'nh4', isReversible: true, flux: 1, enzyme: enz('GDH', '谷氨酸脱氢酶'), isActive: true,
      examPoint: exam("Allosteric enzyme. ATP/GTP inhibits; ADP/GDP activates. Only enzyme using both NAD+ or NADP+.", "考点：别构酶。ATP/GTP抑制；ADP/GDP激活。唯一能同时利用NAD+或NADP+的酶。") 
    },
    { 
      id: 'aa_cps', source: 'nh4', target: 'cp', isReversible: false, flux: 1, enzyme: enz('CPS-I', '氨甲酰磷酸合成酶I'), isActive: true, 
      examPoint: exam(
        "Rate-limiting step of Urea Cycle. Absolute requirement for N-Acetylglutamate (NAG) as activator.", 
        "考点：尿素循环的关键限速酶。绝对依赖 N-乙酰谷氨酸 (NAG) 作为变构激活剂（由精氨酸刺激合成）。"
      ),
      isRateLimiting: true
    },
    { id: 'aa_otc', source: 'cp', target: 'citrulline', isReversible: false, flux: 1, enzyme: enz('OTC', '鸟氨酸氨甲酰转移酶'), isActive: true },
    
    // Transport
    { id: 'aa_trans', source: 'citrulline', target: 'citrulline_cyto', isReversible: false, flux: 1, enzyme: enz('Transport', '转运'), isActive: true },
    
    { id: 'aa_arg', source: 'citrulline_cyto', target: 'arginine', isReversible: false, flux: 1, enzyme: enz('ASS/ASL', 'ASS/ASL'), isActive: true, examPoint: exam("Links Urea cycle to TCA (Aspartate-Arginosuccinate Shunt).", "考点：通过精氨酸代琥珀酸将尿素循环与TCA循环联系起来（双环联系）。") },
    { id: 'aa_urea', source: 'arginine', target: 'urea', isReversible: false, flux: 1, enzyme: enz('Arginase', '精氨酸酶'), isActive: true, examPoint: exam("Exclusively in Liver (Cytosol).", "考点：精氨酸酶主要存在于肝脏细胞质。") },
    
    // Transamination
    { 
      id: 'aa_ast', source: 'aspartate', target: 'oxaloacetate_aa', isReversible: true, flux: 1, enzyme: enz('AST', '谷草转氨酶'), isActive: true,
      examPoint: exam("Requires PLP (Vit B6). Marker for liver/heart damage.", "考点：所有转氨酶都需要磷酸吡哆醛(PLP/Vit B6)作为辅酶。肝/心损伤标志物。") 
    }
  ]
};

// --- 5. NUCLEOTIDE ---

export const NUCLEOTIDE: Pathway = {
  id: 'nucleotide',
  category: PathwayCategory.NUCLEOTIDE,
  name: { en: 'Nucleotide', zh: '核苷酸代谢' },
  description: { en: 'Purine & Pyrimidine', zh: '嘌呤与嘧啶' },
  nodes: [
    // CYTOSOL
    { id: 'ribose5p', name: { en: 'R5P', zh: '核糖-5-磷酸' }, type: NodeType.METABOLITE, fx: 500, fy: 180, compartment: 'cytosol' }, // Shared
    { id: 'prpp', name: { en: 'PRPP', zh: 'PRPP' }, type: NodeType.METABOLITE, fx: 600, fy: 180, compartment: 'cytosol' },
    { id: 'imp', name: { en: 'IMP', zh: 'IMP' }, type: NodeType.METABOLITE, fx: 700, fy: 180, compartment: 'cytosol' },
    { id: 'amp', name: { en: 'AMP', zh: 'AMP' }, type: NodeType.METABOLITE, fx: 800, fy: 150, compartment: 'cytosol' },
    { id: 'gmp', name: { en: 'GMP', zh: 'GMP' }, type: NodeType.METABOLITE, fx: 800, fy: 210, compartment: 'cytosol' },
    // Pyrimidine
    { id: 'ump', name: { en: 'UMP', zh: 'UMP' }, type: NodeType.METABOLITE, fx: 600, fy: 100, compartment: 'cytosol' },
    { id: 'ctp', name: { en: 'CTP', zh: 'CTP' }, type: NodeType.METABOLITE, fx: 500, fy: 100, compartment: 'cytosol' }
  ],
  links: [
    { id: 'nuc_prpp', source: 'ribose5p', target: 'prpp', isReversible: false, flux: 1, enzyme: enz('PRPP Syn', 'PRPP合成酶'), isActive: true },
    { 
      id: 'nuc_imp', source: 'prpp', target: 'imp', isReversible: false, flux: 1, enzyme: enz('GPAT', 'GPAT'), isActive: true, 
      examPoint: exam("Committed step Purine Synthesis. Inhibited by AMP/GMP.", "考点：嘌呤从头合成的限速酶。受AMP/GMP反馈抑制。"),
      isRateLimiting: true
    },
    { 
      id: 'nuc_amp', source: 'imp', target: 'amp', isReversible: false, flux: 1, enzyme: enz('Adenylosuccinate', '腺苷酸琥珀酸'), isActive: true,
      examPoint: exam("Requires GTP as energy source. Inhibited by AMP.", "考点：合成AMP需要GTP供能（交叉调节）。") 
    },
    { 
      id: 'nuc_gmp', source: 'imp', target: 'gmp', isReversible: false, flux: 1, enzyme: enz('IMPDH', 'IMP脱氢酶'), isActive: true,
      examPoint: exam("Requires ATP. Inhibited by Mycophenolic acid (Immunosuppressant).", "考点：合成GMP需要ATP。受麦考酚酸（免疫抑制剂）抑制。") 
    },
    // Pyrimidine
    { 
      id: 'nuc_ump', source: 'prpp', target: 'ump', isReversible: false, flux: 1, enzyme: enz('CAD/UMPS', 'CAD/UMPS'), isActive: true, 
      examPoint: exam(
        "CAD Complex (CPS-II). CPS-II is Cytosolic, uses Gln, inhibited by UTP. Distinct from CPS-I (Urea).", 
        "考点：CAD复合体含CPS-II。CPS-II在细胞质，利用谷氨酰胺，受UTP抑制。注意区别尿素循环的CPS-I（线粒体/利用氨）。"
      ),
      isRateLimiting: true
    },
    { id: 'nuc_ctp', source: 'ump', target: 'ctp', isReversible: false, flux: 1, enzyme: enz('CTP Syn', 'CTP合成酶'), isActive: true }
  ]
};

// --- 6. HEME ---

export const HEME: Pathway = {
  id: 'heme',
  category: PathwayCategory.HEME,
  name: { en: 'Heme Synthesis', zh: '血红素合成' },
  description: { en: 'Porphyrin', zh: '卟啉代谢' },
  nodes: [
    // MITOCHONDRIA
    { id: 'succinyl_coa', name: { en: 'Succinyl-CoA', zh: '琥珀酰CoA' }, type: NodeType.METABOLITE, fx: 1050, fy: 600, compartment: 'mitochondria' }, // Shared
    { id: 'ala', name: { en: 'ALA', zh: 'δ-ALA' }, type: NodeType.METABOLITE, fx: 1150, fy: 600, compartment: 'mitochondria' },
    // CYTOSOL
    { id: 'porphobilinogen', name: { en: 'PBG', zh: '胆色素原' }, type: NodeType.METABOLITE, fx: 1150, fy: 100, compartment: 'cytosol' },
    // MITOCHONDRIA (Final)
    { id: 'heme', name: { en: 'Heme', zh: '血红素' }, type: NodeType.METABOLITE, fx: 1250, fy: 600, compartment: 'mitochondria' }
  ],
  links: [
    { 
      id: 'heme_ala', source: 'succinyl_coa', target: 'ala', isReversible: false, flux: 1, enzyme: enz('ALA Synthase', 'ALA合酶'), isActive: true,
      examPoint: exam(
        "Rate-limiting. Inhibited by Heme (Repression). Requires PLP (Vit B6).", 
        "考点：限速酶。受血红素/葡萄糖反馈阻遏。需要磷酸吡哆醛(PLP/Vit B6)作为辅酶。"
      ),
      isRateLimiting: true
    },
    { 
      id: 'heme_pbg', source: 'ala', target: 'porphobilinogen', isReversible: false, flux: 1, enzyme: enz('ALA Dehydratase', 'ALA脱水酶'), isActive: true,
      examPoint: exam("Contains Zinc. Inhibited by Lead (Pb). Accumulation of ALA causes neurological symptoms.", "考点：含锌酶。极易受铅(Pb)抑制，导致ALA堆积（神经毒性）。")
    },
    { 
      id: 'heme_syn', source: 'porphobilinogen', target: 'heme', isReversible: false, flux: 1, enzyme: enz('Ferrochelatase', '亚铁螯合酶'), isActive: true,
      examPoint: exam("In Mitochondria. Also inhibited by Lead.", "考点：定位线粒体。同样受铅抑制。")
    }
  ]
};

export const ALL_PATHWAYS: Record<string, Pathway> = {
  glycolysis: GLYCOLYSIS,
  tca: TCA_CYCLE,
  ppp: PPP,
  glycogen: GLYCOGEN,
  oxphos: OXPHOS,
  lipid: LIPID_METABOLISM,
  amino_acid: AMINO_ACID,
  nucleotide: NUCLEOTIDE,
  heme: HEME
};

// Simulation Rules
export const SIMULATION_RULES: SimulationRule[] = [
  {
    state: PhysioState.STARVATION,
    pathwayId: 'glycolysis',
    fluxMultipliers: { 'gly_1': 0.1, 'gly_3': 0.1, 'gly_11': 0.1, 'gng_2': 2.0, 'gly_3_rev': 2.0 } 
  },
  {
    state: PhysioState.STARVATION,
    pathwayId: 'lipid',
    fluxMultipliers: { 'box_0': 2.0, 'cpt_1': 2.0, 'box_2': 2.0, 'fas_1': 0.1 } 
  },
  {
    state: PhysioState.FED,
    pathwayId: 'glycolysis',
    fluxMultipliers: { 'gly_1': 1.5, 'gly_3': 1.5, 'gng_2': 0.1 }
  },
  {
    state: PhysioState.FED,
    pathwayId: 'glycogen',
    fluxMultipliers: { 'gly_syn': 2.0, 'gly_deg': 0.1 }
  }
];
