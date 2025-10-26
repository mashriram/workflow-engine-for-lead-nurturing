
import { NodeFunction } from '../../../../workflow-engine/core/types';
import { LeadData } from '../../types';

export const markCompleted: NodeFunction<LeadData> = async (state, params) => {
  const { status = 'completed' } = params || {};
  
  console.log(`Marking lead as ${status}`);
  
  return {
    ...state,
    contextData: {
      ...state.contextData,
      status,
    },
    variables: {
      ...state.variables,
      completionStatus: status,
      completedAt: Date.now(),
    },
  };
};
