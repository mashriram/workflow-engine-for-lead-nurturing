
import { Node, WorkflowState, NodeExecutionState, ApiOptions, FunctionDefinition, AuthOptions } from './types';
import { FunctionRegistry } from './registry';
import { SchedulerService } from './scheduler';

function isApiOptions<T>(def: FunctionDefinition<T>): def is ApiOptions {
  return typeof def === 'object' && 'url' in def;
}

export class NodeExecutor<T> {
  constructor(
    private registry: FunctionRegistry<T>,
    private scheduler: SchedulerService
  ) {}

  public async execute(node: Node, state: WorkflowState<T>): Promise<WorkflowState<T>> {
    const nodeState: NodeExecutionState = state.nodeStates[node.id] || {
      nodeId: node.id,
      status: 'pending',
      attempts: 0,
    };

    let updatedState: WorkflowState<T> = {
      ...state,
      nodeStates: {
        ...state.nodeStates,
        [node.id]: { ...nodeState, status: 'running', startTime: Date.now(), attempts: nodeState.attempts + 1 },
      },
    };

    const inputContext = state.contextData;

    try {
      let resultState: WorkflowState<T>;
      switch (node.type) {
        case 'start':
        case 'end':
        case 'decision':
          resultState = updatedState; // These nodes are pass-through in this implementation
          break;
        case 'action':
          resultState = await this.executeAction(node, updatedState);
          break;
        case 'wait':
          await this.scheduler.wait(node.config.waitDuration || 0);
          resultState = updatedState;
          break;
        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }
      
      const outputContext = resultState.contextData;
      const finalNodeState: NodeExecutionState = {
        ...resultState.nodeStates[node.id],
        status: 'completed',
        endTime: Date.now(),
      };

      const historyEntry = {
        timestamp: Date.now(),
        nodeId: node.id,
        action: node.label,
        status: 'success' as const,
        duration: finalNodeState.endTime! - finalNodeState.startTime!,
        input: inputContext,
        output: outputContext,
      };

      return {
        ...resultState,
        nodeStates: { ...resultState.nodeStates, [node.id]: finalNodeState },
        executionHistory: [...resultState.executionHistory, historyEntry],
      };
    } catch (error) {
      console.error(`Error executing node ${node.id}:`, error);
      const errorInfo = {
          code: 'NODE_EXECUTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          nodeId: node.id,
          timestamp: Date.now(),
      };
      
      const failedNodeState: NodeExecutionState = {
          ...updatedState.nodeStates[node.id],
          status: 'failed',
          endTime: Date.now(),
          error: errorInfo
      };

      const historyEntry = {
        timestamp: Date.now(),
        nodeId: node.id,
        action: node.label,
        status: 'failure' as const,
        details: errorInfo.message,
        duration: failedNodeState.endTime! - failedNodeState.startTime!,
        input: inputContext,
      };

      return {
        ...updatedState,
        nodeStates: { ...updatedState.nodeStates, [node.id]: failedNodeState },
        executionHistory: [...updatedState.executionHistory, historyEntry],
        error: errorInfo,
        status: 'failed' as const
      };
    }
  }

  private async executeAction(node: Node, state: WorkflowState<T>): Promise<WorkflowState<T>> {
    const { functionRef, params, api } = node.config;

    if (api) {
      return this.executeApiAction(api, state, params);
    }

    if (!functionRef) {
      throw new Error(`Node ${node.id} of type 'action' is missing a functionRef or api config.`);
    }

    const funcDef = this.registry.getFunction(functionRef);
    if (!funcDef) {
      throw new Error(`Function "${functionRef}" not found in registry for node ${node.id}.`);
    }

    if (isApiOptions(funcDef)) {
      return this.executeApiAction(funcDef, state, params);
    }

    if (typeof funcDef === 'function') {
      // This is a temporary workaround to satisfy TypeScript
      // We need to ensure that the function is of type NodeFunction<T>
      const nodeFunction = funcDef as (state: WorkflowState<T>, params?: Record<string, any>) => Promise<WorkflowState<T>>;
      return await nodeFunction(state, params);
    }

    throw new Error(`Unsupported function definition for "${functionRef}".`);
  }

  private async executeApiAction(api: ApiOptions, state: WorkflowState<T>, params?: Record<string, any>): Promise<WorkflowState<T>> {
    const headers = new Headers(api.headers || {});
    if (api.auth) {
      this.applyAuth(headers, api.auth);
    }

    // Simple templating for URL
    const url = this.replacePlaceholders(api.url, { ...state, params });

    const body = api.body ? this.replacePlaceholders(api.body, { ...state, params }) : undefined;

    const response = await fetch(url, {
      method: api.method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
    }

    const responseData = await response.json();

    return {
      ...state,
      contextData: {
        ...state.contextData,
        ...responseData,
      },
    };
  }

  private applyAuth(headers: Headers, auth: AuthOptions) {
    switch (auth.type) {
      case 'bearer':
        if (auth.credentials.token) {
          headers.set('Authorization', `Bearer ${this.replacePlaceholders(auth.credentials.token, {})}`);
        }
        break;
      case 'apiKey':
        if (auth.credentials.apiKey) {
          headers.set('X-API-Key', this.replacePlaceholders(auth.credentials.apiKey, {}));
        }
        break;
      // OAuth2 would be more complex and might involve a token refresh flow
    }
  }

  private replacePlaceholders(template: any, context: any): any {
    if (typeof template === 'string') {
      return template.replace(/\${(.*?)}/g, (_, key) => {
        const value = key.split('.').reduce((acc, k) => acc && acc[k], context);
        return value !== undefined ? String(value) : '';
      });
    }
    if (Array.isArray(template)) {
      return template.map(item => this.replacePlaceholders(item, context));
    }
    if (typeof template === 'object' && template !== null) {
      return Object.fromEntries(
        Object.entries(template).map(([key, value]) => [key, this.replacePlaceholders(value, context)])
      );
    }
    return template;
  }
}