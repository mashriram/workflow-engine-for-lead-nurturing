
import { NodeFunction } from '../../../../workflow-engine/core/types';
import { LeadData } from '../../types';

export const fetchLeads: NodeFunction<LeadData> = async (state, params) => {
  console.log('Fetching leads from:', params?.source);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock lead data
  const mockLead: Partial<LeadData> = {
    status: 'new',
    source: params?.source || 'api',
  };
  
  return {
    ...state,
    contextData: {
      ...state.contextData,
      ...mockLead,
    },
  };
};
