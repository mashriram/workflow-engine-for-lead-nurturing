
import { EdgeConditionFunction } from '@/workflow-engine/core/types';
import { LeadData } from '../../types';

export const checkEmailResponse: EdgeConditionFunction<LeadData> = async (state, params) => {
  const { expectedStatus } = params || {};
  
  // Simulate checking for email response
  const hasResponse = Math.random() > 0.7; // 30% chance of response
  const status = hasResponse ? 'replied' : 'no_reply';
  
  if (expectedStatus && status === expectedStatus) {
    return expectedStatus;
  }
  
  return null;
};
