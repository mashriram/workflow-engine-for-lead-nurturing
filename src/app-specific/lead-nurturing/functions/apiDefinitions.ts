
import { FunctionRegistryEntry } from '../../../workflow-engine/core/types';
import { LeadData } from '../types';

export const leadNurturingApiDefs: FunctionRegistryEntry<LeadData>[] = [
  {
    name: 'fetchLeadsFromApi',
    type: 'node',
    description: 'Fetch leads from a remote API',
    definition: {
      url: 'https://api.example.com/leads',
      method: 'GET',
      auth: {
        type: 'bearer',
        credentials: { token: '${variables.apiToken}' },
      },
    },
    schema: {},
  },
  {
    name: 'sendEmailToLead',
    type: 'node',
    description: 'Send an email to a lead',
    definition: {
      url: 'https://api.example.com/send-email',
      method: 'POST',
      body: {
        recipient: '${contextData.email}',
        subject: 'Following up on your inquiry',
        body: 'Hello ${contextData.name}, ...',
      },
      auth: {
        type: 'apiKey',
        credentials: { apiKey: '${variables.emailApiKey}' },
      },
    },
    schema: {},
  },
  {
    name: 'checkEmailReply',
    type: 'edge',
    description: 'Check if a lead has replied to an email',
    definition: {
      url: 'https://api.example.com/email-status/${contextData.id}',
      method: 'GET',
      auth: {
        type: 'bearer',
        credentials: { token: '${variables.apiToken}' },
      },
    },
    schema: {},
  },
];
