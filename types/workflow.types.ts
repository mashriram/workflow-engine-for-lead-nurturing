
export interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: Node[];
  edges: Edge[];
  initialState?: Record<string, any>;
  settings?: WorkflowSettings;
}

export interface WorkflowSettings {
  maxRetries?: number;
  timeout?: number; 
  errorHandling?: 'stop' | 'continue' | 'skip';
}

export interface Node {
  id: string;
  type: NodeType;
  label: string;
  config: NodeConfig;
  position?: Position;
  metadata?: Record<string, any>;
}

export type NodeType = 
  | 'start'
  | 'end'
  | 'action'
  | 'wait'
  | 'decision'
  | 'parallel'
  | 'merge';

export interface NodeConfig {
  action?: string;
  functionRef?: string;
  params?: Record<string, any>;
  waitDuration?: number;
  retryConfig?: RetryConfig;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  initialDelay: number;
  maxDelay?: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: EdgeType;
  condition?: EdgeCondition;
}

export type EdgeType = 'default' | 'conditional' | 'parallel';

export interface EdgeCondition {
  functionRef: string;
  params?: Record<string, any>;
  fallbackTarget?: string;
}

export interface WorkflowState {
  workflowId: string;
  executionId: string;
  status: ExecutionStatus;
  currentNodeId: string | null;
  leadData: LeadData;
  nodeStates: Record<string, NodeExecutionState>;
  executionHistory: ExecutionHistoryEntry[];
  variables: Record<string, any>;
  startTime: number;
  endTime?: number;
  error?: ErrorInfo;
}

export type ExecutionStatus = 
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface NodeExecutionState {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  attempts: number;
  startTime?: number;
  endTime?: number;
  result?: any;
  error?: ErrorInfo;
  nextExecutionTime?: number;
}

export interface ExecutionHistoryEntry {
  timestamp: number;
  nodeId: string;
  action: string;
  status: 'success' | 'failure';
  details?: any;
  duration?: number;
}

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

export interface ErrorInfo {
  code: string;
  message: string;
  nodeId?: string;
  timestamp: number;
  stack?: string;
}

export interface Position {
  x: number;
  y: number;
}

export type NodeFunction = (
  state: WorkflowState,
  params?: Record<string, any>
) => Promise<WorkflowState>;

export type EdgeConditionFunction = (
  state: WorkflowState,
  params?: Record<string, any>
) => Promise<string | null>;

export interface FunctionRegistryEntry {
  name: string;
  type: 'node' | 'edge';
  description: string;
  function: NodeFunction | EdgeConditionFunction;
  schema?: Record<string, any>;
}