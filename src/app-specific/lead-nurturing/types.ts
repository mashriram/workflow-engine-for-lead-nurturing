
export interface LeadData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  source?: string;
  classification?: string;
  customFields?: Record<string, any>;
  communicationHistory?: CommunicationRecord[];
}

export interface CommunicationRecord {
  timestamp: number;
  channel: 'call' | 'email' | 'sms';
  direction: 'outbound' | 'inbound';
  status: string;
  details?: any;
}
