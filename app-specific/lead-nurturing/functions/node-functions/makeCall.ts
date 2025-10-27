
import { NodeFunction } from '@/workflow-engine/core/types';
import { LeadData } from '../../types';

export const makeCall: NodeFunction<LeadData> = async (state, params) => {
  const { attemptNumber = 1 } = params || {};
  
  console.log(`Making call attempt ${attemptNumber} to ${state.contextData.phone}`);
  
  // Simulate call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate outcomes
  const outcomes = ['answered', 'voicemail', 'no_answer', 'busy'];
  const callStatus = outcomes[Math.floor(Math.random() * outcomes.length)];
  
  return {
    ...state,
    variables: {
      ...state.variables,
      lastCallStatus: callStatus,
      lastCallAttempt: attemptNumber,
      lastCallTime: Date.now(),
    },
    contextData: {
      ...state.contextData,
      communicationHistory: [
        ...(state.contextData.communicationHistory || []),
        {
          timestamp: Date.now(),
          channel: 'call' as const,
          direction: 'outbound' as const,
          status: callStatus,
          details: { attemptNumber },
        },
      ],
    },
  };
};
