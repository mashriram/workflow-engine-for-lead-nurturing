import { Node, WorkflowState, NodeExecutionState } from './types';
import { FunctionRegistry } from './registry';
import { SchedulerService } from './scheduler';

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
    const { functionRef, params } = node.config;
    if (!functionRef) {
      throw new Error(`Node ${node.id} of type 'action' is missing a functionRef.`);
    }

    const func = this.registry.getNodeFunction(functionRef);
    if (!func) {
      throw new Error(`Function "${functionRef}" not found in registry for node ${node.id}.`);
    }

    return await func(state, params);
  }
}