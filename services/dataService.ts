
import { Pathway, PhysioState, PathwayCategory, Node, Link } from '../types';
import { ALL_PATHWAYS, SIMULATION_RULES } from '../data/mockData';

// Simulate async data fetching
export const fetchPathway = async (id: string): Promise<Pathway> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(ALL_PATHWAYS[id] || ALL_PATHWAYS['glycolysis'])));
    }, 300);
  });
};

export const fetchCategory = async (category: PathwayCategory): Promise<Pathway> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let relevantPathways: Pathway[];
      
      if (category === PathwayCategory.INTEGRATION) {
        // Fetch ALL pathways for the full map
        relevantPathways = Object.values(ALL_PATHWAYS);
      } else {
        // Find all pathways in this category
        relevantPathways = Object.values(ALL_PATHWAYS).filter(p => p.category === category);
      }
      
      if (relevantPathways.length === 0) {
        resolve(JSON.parse(JSON.stringify(ALL_PATHWAYS['glycolysis']))); // Fallback
        return;
      }

      // Merge Logic
      const mergedNodes = new Map<string, Node>();
      const initialLinks: Link[] = [];

      relevantPathways.forEach(p => {
        p.nodes.forEach(n => {
          if (!mergedNodes.has(n.id)) {
            // Use the position from the first pathway that defines it (usually consistent)
            mergedNodes.set(n.id, { ...n, group: p.id }); 
          }
        });
        
        p.links.forEach(l => {
          initialLinks.push({ ...l });
        });
      });

      // Intelligent Link Merging for Bidirectional Reactions
      // If we have A->B (Enzyme 1) and B->A (Enzyme 2), merge them into one visual link
      const mergedLinks: Link[] = [];
      const processedIndices = new Set<number>();

      for (let i = 0; i < initialLinks.length; i++) {
        if (processedIndices.has(i)) continue;

        const forward = initialLinks[i];
        let reverseIndex = -1;

        // Look for a reverse link (B->A)
        for (let j = 0; j < initialLinks.length; j++) {
          if (i === j || processedIndices.has(j)) continue;
          const candidate = initialLinks[j];
          if (candidate.source === forward.target && candidate.target === forward.source) {
            reverseIndex = j;
            break;
          }
        }

        if (reverseIndex !== -1) {
          const reverse = initialLinks[reverseIndex];
          
          // Merge logic: use forward structure but note it is bidirectional and separate enzyme
          // If forward doesn't have an enzyme but reverse does, logic still holds
          mergedLinks.push({
            ...forward,
            isReversible: true,
            enzymeReverse: reverse.enzyme, // This is the crucial step: capturing the reverse enzyme
          });
          processedIndices.add(i);
          processedIndices.add(reverseIndex);
        } else {
          mergedLinks.push(forward);
          processedIndices.add(i);
        }
      }

      const mergedPathway: Pathway = {
        id: `cat_${category}`,
        category: category,
        name: { en: `${getCategoryName(category, 'en')} Metabolism`, zh: `${getCategoryName(category, 'zh')}代谢` },
        description: { en: `Integrated view of ${category} pathways`, zh: `${getCategoryName(category, 'zh')}相关通路的整合视图` },
        nodes: Array.from(mergedNodes.values()),
        links: mergedLinks
      };

      resolve(mergedPathway);
    }, 500);
  });
};

function getCategoryName(cat: string, lang: 'en' | 'zh'): string {
   if (lang === 'zh') {
     switch(cat) {
       case 'carbohydrate': return '碳水化合物';
       case 'lipid': return '脂质';
       case 'amino_acid': return '氨基酸';
       case 'nucleotide': return '核苷酸';
       case 'energy': return '能量';
       case 'heme': return '血红素';
       case 'integration': return '全网络';
       default: return '';
     }
   } else {
     switch(cat) {
       case 'carbohydrate': return 'Carbohydrate';
       case 'lipid': return 'Lipid';
       case 'amino_acid': return 'Amino Acid';
       case 'nucleotide': return 'Nucleotide';
       case 'energy': return 'Energy';
       case 'heme': return 'Heme';
       case 'integration': return 'Full Network';
       default: return cat;
     }
   }
}

export const applySimulation = (pathway: Pathway, state: PhysioState): Pathway => {
  const newPathway = JSON.parse(JSON.stringify(pathway)) as Pathway;

  // Apply global state rules
  const relevantRules = SIMULATION_RULES.filter(r => r.state === state);

  relevantRules.forEach(rule => {
    newPathway.links.forEach(link => {
       let applies = false;
       if (rule.pathwayId === pathway.id) applies = true; 
       else if (pathway.id.startsWith('cat_')) {
          // Heuristic matching for merged views
          if (rule.pathwayId === 'glycolysis' && link.id.startsWith('gly_')) applies = true;
          if (rule.pathwayId === 'glycolysis' && link.id.startsWith('gng_')) applies = true; // GNG is inside glycolysis object for now
          if (rule.pathwayId === 'tca' && ['pdh','cs','tca_'].some(p => link.id.startsWith(p))) applies = true;
          if (rule.pathwayId === 'lipid' && (link.id.startsWith('box_') || link.id.startsWith('fas_'))) applies = true;
          if (rule.pathwayId === 'glycogen' && (link.id.startsWith('gly_syn') || link.id.startsWith('gly_deg'))) applies = true;
       }

       if (applies && rule.fluxMultipliers[link.id] !== undefined) {
         link.flux = rule.fluxMultipliers[link.id];
       }
    });
  });

  return newPathway;
};
