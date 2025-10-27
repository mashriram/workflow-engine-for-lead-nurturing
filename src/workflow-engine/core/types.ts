
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

export interface WorkflowState<T> {
  workflowId: string;
  executionId: string;
  status: ExecutionStatus;
  currentNodeId: string | null;
  contextData: T;
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
  input?: any;
  output?: any;
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


export interface ApiOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: Record<string, any>;
  auth?: AuthOptions;
}

export interface AuthOptions {
  type: 'apiKey' | 'bearer' | 'oauth2';
  credentials: {
    token?: string;
    apiKey?: string;
    apiSecret?: string;
    // More fields for OAuth2 can be added here
  };
}

export type NodeFunction<T> = (
  state: WorkflowState<T>,
  params?: Record<string, any>
) => Promise<WorkflowState<T>>;

export type EdgeConditionFunction<T> = (
  state: WorkflowState<T>,
  params?: Record<string, any>
) => Promise<string | null>;

export type FunctionDefinition<T> = NodeFunction<T> | EdgeConditionFunction<T> | ApiOptions;

export interface FunctionRegistryEntry<T> {
  name: string;
  type: 'node' | 'edge';
  description: string;
  definition: FunctionDefinition<T>;
  schema?: Record<string, any>;
}

declare module './types' {
  interface NodeConfig {
    api?: ApiOptions;
  }
  interface EdgeCondition {
    api?: ApiOptions;
  }
}

