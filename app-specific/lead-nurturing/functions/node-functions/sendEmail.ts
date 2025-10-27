
import { NodeFunction } from '@/workflow-engine/core/types';
import { LeadData } from '../../types';

export const sendEmail: NodeFunction<LeadData> = async (state, params) => {
  const { template = 'default' } = params || {};
  
  console.log(`Sending email (${template}) to ${state.contextData.email}`);
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    ...state,
    variables: {
      ...state.variables,
      lastEmailSent: Date.now(),
      lastEmailTemplate: template,
    },
    contextData: {
      ...state.contextData,
      communicationHistory: [
        ...(state.contextData.communicationHistory || []),
        {
          timestamp: Date.now(),
          channel: 'email' as const,
          direction: 'outbound' as const,
          status: 'sent',
          details: { template },
        },
      ],
    },
  };
};
