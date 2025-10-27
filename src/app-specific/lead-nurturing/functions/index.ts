

import { FunctionRegistry } from '../../../workflow-engine/core/registry';
import { LeadData } from '../types';
import { setFunctionRegistry } from '../../../workflow-engine/ui/hooks/useWorkflowEngine';
import { leadNurturingApiDefs } from './apiDefinitions';
import { FunctionRegistryEntry } from '../../../workflow-engine/core/types';

// Node functions
import { fetchLeads } from './node-functions/fetchLeads';
import { classifyLead } from './node-functions/classifyLead';
import { makeCall } from './node-functions/makeCall';
import { sendEmail } from './node-functions/sendEmail';
import { sendSMS } from './node-functions/sendSMS';
import { markCompleted } from './node-functions/markCompleted';

// Edge conditions
import { checkCallStatus } from './edge-conditions/checkCallStatus';
import { checkEmailResponse } from './edge-conditions/checkEmailResponse';
import { checkSMSResponse } from './edge-conditions/checkSMSResponse';

const localFunctions: FunctionRegistryEntry<LeadData>[] = [
    { name: 'fetchLeads', type: 'node', description: 'Fetch leads from API or database', definition: fetchLeads },
    { name: 'classifyLead', type: 'node', description: 'Classify lead based on criteria', definition: classifyLead },
    { name: 'makeCall', type: 'node', description: 'Make a phone call to the lead', definition: makeCall },
    { name: 'sendEmail', type: 'node', description: 'Send email to the lead', definition: sendEmail },
    { name: 'sendSMS', type: 'node', description: 'Send SMS to the lead', definition: sendSMS },
    { name: 'markCompleted', type: 'node', description: 'Mark lead as completed', definition: markCompleted },
    { name: 'checkCallStatus', type: 'edge', description: 'Check call outcome status', definition: checkCallStatus },
    { name: 'checkEmailResponse', type: 'edge', description: 'Check if email was responded to', definition: checkEmailResponse },
    { name: 'checkSMSResponse', type: 'edge', description: 'Check if SMS was responded to', definition: checkSMSResponse },
];

export function setupLeadNurturingApplication() {
    setFunctionRegistry((registry: FunctionRegistry<LeadData>) => {
        const allFunctions = [...localFunctions, ...leadNurturingApiDefs];
        allFunctions.forEach(entry => registry.register(entry));
    });
}

