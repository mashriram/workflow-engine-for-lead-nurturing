
import { WorkflowConfig, WorkflowState } from './types';
import { FunctionRegistry } from './registry';
import { StateManager } from './state';
import { NodeExecutor } from './executor';
import { EdgeRouter } from './router';
import { SchedulerService } from './scheduler';

type Subscriber<T> = (state: WorkflowState<T>) => void;

export class WorkflowEngine<T> {
  private nodeExecutor: NodeExecutor<T>;
  private edgeRouter: EdgeRouter<T>;
  private scheduler: SchedulerService;
  private executions = new Map<string, { state: WorkflowState<T>, controller: AbortController }>();
  private subscribers: Subscriber<T>[] = [];

  constructor(
    private config: WorkflowConfig,
    private registry: FunctionRegistry<T>,
    private stateManager: StateManager<T>
  ) {
    this.scheduler = new SchedulerService();
    this.nodeExecutor = new NodeExecutor<T>(this.registry, this.scheduler);
    this.edgeRouter = new EdgeRouter<T>(this.config, this.registry);
  }

  public async initialize(contextData: T): Promise<string> {
    const state = this.stateManager.createState(this.config.id, contextData, this.config.initialState);
    const startNode = this.config.nodes.find(n => n.type === 'start');
    if (!startNode) throw new Error('Workflow must have a start node.');
    
    state.currentNodeId = startNode.id;
    await this.stateManager.saveState(state);
    this.executions.set(state.executionId, { state, controller: new AbortController() });
    return state.executionId;
  }

  public async start(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) throw new Error(`Execution ${executionId} not found.`);
    
    execution.state.status = 'running';
    this.notifySubscribers(execution.state);
    
    this.executeWorkflow(executionId);
  }

  private async executeWorkflow(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution || execution.state.status !== 'running') return;

    let { state, controller } = execution;

    while (state.currentNodeId && state.status === 'running') {
      if (controller.signal.aborted) {
          state.status = 'cancelled';
          break;
      }

      const currentNode = this.config.nodes.find(n => n.id === state.currentNodeId);
      if (!currentNode) {
        state.error = { code: 'NODE_NOT_FOUND', message: `Node ${state.currentNodeId} not found.`, timestamp: Date.now() };
        state.status = 'failed';
        break;
      }

      state = await this.nodeExecutor.execute(currentNode, state);

      if (state.status === 'failed' || currentNode.type === 'end') {
        state.status = state.status === 'failed' ? 'failed' : 'completed';
        state.endTime = Date.now();
        state.currentNodeId = null;
      } else {
        state.currentNodeId = await this.edgeRouter.getNextNode(currentNode.id, state);
      }
      
      this.executions.set(executionId, { ...execution, state });
      await this.stateManager.saveState(state);
      this.notifySubscribers(state);
    }
    
    const finalExecution = this.executions.get(executionId);
    if (finalExecution) {
        let finalState = finalExecution.state;
        if (finalState.status === 'running' && !finalState.currentNodeId) {
            finalState.status = 'completed';
            finalState.endTime = Date.now();
            
            this.executions.set(executionId, { ...finalExecution, state: finalState });
            await this.stateManager.saveState(finalState);
            this.notifySubscribers(finalState);
        }
    }
  }

  public pause(executionId: string): void {
    const execution = this.executions.get(executionId);
    if (execution && execution.state.status === 'running') {
      execution.state.status = 'paused';
      this.notifySubscribers(execution.state);
    }
  }

  public async resume(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (execution && execution.state.status === 'paused') {
      execution.state.status = 'running';
      this.notifySubscribers(execution.state);
      this.executeWorkflow(executionId);
    }
  }

  public stop(executionId: string): void {
    const execution = this.executions.get(executionId);
    if (execution) {
      execution.controller.abort();
      execution.state.status = 'cancelled';
      execution.state.endTime = Date.now();
      this.notifySubscribers(execution.state);
      this.stateManager.saveState(execution.state);
    }
  }
  
  public getState(executionId: string): WorkflowState<T> | undefined {
    return this.executions.get(executionId)?.state;
  }

  public subscribe(callback: Subscriber<T>): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
  
  private notifySubscribers(state: WorkflowState<T>): void {
    this.subscribers.forEach(sub => sub(state));
  }
}
