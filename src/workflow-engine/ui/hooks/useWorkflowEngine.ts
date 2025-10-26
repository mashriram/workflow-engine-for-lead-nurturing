
import { useEffect, useRef, useState, useCallback } from 'react';
import { WorkflowEngine } from '../../core/engine';
import { FunctionRegistry } from '../../core/registry';
import { StateManager } from '../../core/state';
import { WorkflowConfig, WorkflowState } from '../../core/types';
import { useWorkflowStore } from '../store/workflowStore';

// A placeholder for a function that will register application-specific functions.
// The actual implementation is provided by the application layer.
let registerAppFunctions: any;

// This function allows the application to inject its function registration logic.
export const setFunctionRegistry = <T>(registerFn: (registry: FunctionRegistry<T>) => void) => {
  registerAppFunctions = registerFn;
}

export function useWorkflowEngine<T>(config: WorkflowConfig | null) {
  const engineRef = useRef<WorkflowEngine<T> | null>(null);
  const [executionId, _setExecutionId] = useState<string | null>(null);
  const executionIdRef = useRef<string | null>(null);
  const { setCurrentState, setIsExecuting, reset } = useWorkflowStore();

  const setExecutionId = useCallback((id: string | null) => {
    _setExecutionId(id);
    executionIdRef.current = id;
  }, []);
  
  useEffect(() => {
    if (!config) {
        engineRef.current = null;
        return;
    }
    
    if (typeof registerAppFunctions !== 'function') {
        throw new Error('Function registry has not been set. Call setFunctionRegistry before using this hook.');
    }

    const registry = new FunctionRegistry<T>();
    registerAppFunctions(registry);
    
    const stateManager = new StateManager<T>();
    const engine = new WorkflowEngine<T>(config, registry, stateManager);
    engineRef.current = engine;
    
    const unsubscribe = engine.subscribe((state: WorkflowState<T>) => {
      setCurrentState(state);
      setIsExecuting(state.status === 'running' || state.status === 'paused');
    });
    
    return () => {
      unsubscribe();
      if(executionIdRef.current) {
        engineRef.current?.stop(executionIdRef.current);
      }
    };
  }, [config, setCurrentState, setIsExecuting]);
  
  const startWorkflow = useCallback(async (contextData: T) => {
    if (!engineRef.current) return;
    
    reset();
    const id = await engineRef.current.initialize(contextData);
    setExecutionId(id);
    await engineRef.current.start(id);
  }, [reset, setExecutionId]);
  
  const pauseWorkflow = useCallback(() => {
    if (!engineRef.current || !executionId) return;
    engineRef.current.pause(executionId);
  }, [executionId]);
  
  const resumeWorkflow = useCallback(async () => {
    if (!engineRef.current || !executionId) return;
    await engineRef.current.resume(executionId);
  }, [executionId]);
  
  const stopWorkflow = useCallback(() => {
    if (!engineRef.current || !executionId) return;
    engineRef.current.stop(executionId);
    setIsExecuting(false);
    setExecutionId(null);
  }, [executionId, setIsExecuting, setExecutionId]);
  
  return {
    startWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    stopWorkflow,
    executionId,
  };
}
