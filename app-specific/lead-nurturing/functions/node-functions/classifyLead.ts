
import { NodeFunction } from '@/workflow-engine/core/types';
import { LeadData } from '../../types';

export const classifyLead: NodeFunction<LeadData> = async (state) => {
  console.log('Classifying lead:', state.contextData.id);
  
  // Simulate classification logic
  const classifications = ['hot', 'warm', 'cold'];
  const classification = classifications[Math.floor(Math.random() * classifications.length)];
  
  return {
    ...state,
    contextData: {
      ...state.contextData,
      classification,
    },
    variables: {
      ...state.variables,
      classification,
    },
  };
};
