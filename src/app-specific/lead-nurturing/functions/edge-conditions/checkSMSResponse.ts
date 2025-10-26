
import { EdgeConditionFunction } from '../../../../workflow-engine/core/types';
import { LeadData } from '../../types';

export const checkSMSResponse: EdgeConditionFunction<LeadData> = async (state, params) => {
  const { expectedStatus } = params || {};
  
  // Simulate checking for SMS response
  const hasResponse = Math.random() > 0.8; // 20% chance of response
  const status = hasResponse ? 'replied' : 'no_reply';
  
  console.log(`Checking SMS response. Expected: ${expectedStatus}, Status: ${status}`);
  
  if (expectedStatus && status === expectedStatus) {
    return expectedStatus;
  }
  
  return null;
};
