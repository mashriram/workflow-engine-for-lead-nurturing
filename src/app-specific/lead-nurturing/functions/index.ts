
import { FunctionRegistry } from '../../../workflow-engine/core/registry';
import { LeadData } from '../types';

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
import { setFunctionRegistry } from '../../../workflow-engine/ui/hooks/useWorkflowEngine';

export function setupLeadNurturingApplication() {
    setFunctionRegistry((registry: FunctionRegistry<LeadData>) => {
        // Register node functions
        registry.registerNodeFunction('fetchLeads', fetchLeads, 'Fetch leads from API or database');
        registry.registerNodeFunction('classifyLead', classifyLead, 'Classify lead based on criteria');
        registry.registerNodeFunction('makeCall', makeCall, 'Make a phone call to the lead');
        registry.registerNodeFunction('sendEmail', sendEmail, 'Send email to the lead');
        registry.registerNodeFunction('sendSMS', sendSMS, 'Send SMS to the lead');
        registry.registerNodeFunction('markCompleted', markCompleted, 'Mark lead as completed');
        
        // Register edge conditions
        registry.registerEdgeCondition('checkCallStatus', checkCallStatus, 'Check call outcome status');
        registry.registerEdgeCondition('checkEmailResponse', checkEmailResponse, 'Check if email was responded to');
        registry.registerEdgeCondition('checkSMSResponse', checkSMSResponse, 'Check if SMS was responded to');
    });
}
