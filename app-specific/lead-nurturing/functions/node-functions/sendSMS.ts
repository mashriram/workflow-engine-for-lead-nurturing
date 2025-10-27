
import { NodeFunction } from '@/workflow-engine/core/types';
import { LeadData } from '../../types';

export const sendSMS: NodeFunction<LeadData> = async (state, params) => {
  const { template = 'default' } = params || {};
  
  console.log(`Sending SMS (${template}) to ${state.contextData.phone}`);
  
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    ...state,
    variables: {
      ...state.variables,
      lastSMSSent: Date.now(),
      lastSMSTemplate: template,
    },
    contextData: {
      ...state.contextData,
      communicationHistory: [
        ...(state.contextData.communicationHistory || []),
        {
          timestamp: Date.now(),
          channel: 'sms' as const,
          direction: 'outbound' as const,
          status: 'sent',
          details: { template },
        },
      ],
    },
  };
};
