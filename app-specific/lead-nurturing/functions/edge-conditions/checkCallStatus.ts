
import { EdgeConditionFunction } from '@/workflow-engine/core/types';
import { LeadData } from '../../types';

export const checkCallStatus: EdgeConditionFunction<LeadData> = async (state, params) => {
  const { expectedStatus } = params || {};
  const lastCallStatus = state.variables?.lastCallStatus;
  
  // The function should only return a truthy value if its specific condition is met.
  // The EdgeRouter is responsible for handling fallbacks if no condition matches.
  if (expectedStatus && lastCallStatus === expectedStatus) {
    return expectedStatus;
  }

  return null; // Condition not met
};
