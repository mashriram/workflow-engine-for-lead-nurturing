
import { WorkflowState } from './types';

export class StateManager<T> {
  private getStorageKey(executionId: string): string {
    return `workflow_state_${executionId}`;
  }

  public createState(workflowId: string, contextData: T, initialState: Record<string, any> = {}): WorkflowState<T> {
    const executionId = `${workflowId}_${Date.now()}`;
    return {
      workflowId,
      executionId,
      status: 'idle',
      currentNodeId: null,
      contextData,
      nodeStates: {},
      executionHistory: [],
      variables: initialState,
      startTime: Date.now(),
    };
  }

  public async saveState(state: WorkflowState<T>): Promise<void> {
    localStorage.setItem(this.getStorageKey(state.executionId), JSON.stringify(state));
  }

  public async loadState(executionId: string): Promise<WorkflowState<T> | null> {
    const savedState = localStorage.getItem(this.getStorageKey(executionId));
    return savedState ? JSON.parse(savedState) : null;
  }

  public async deleteState(executionId: string): Promise<void> {
    localStorage.removeItem(this.getStorageKey(executionId));
  }

  public async listExecutions(workflowId?: string): Promise<WorkflowState<T>[]> {
    const executions: WorkflowState<T>[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('workflow_state_')) {
        const state = await this.loadState(key.replace('workflow_state_', ''));
        if (state && (!workflowId || state.workflowId === workflowId)) {
          executions.push(state);
        }
      }
    }
    return executions;
  }
}
