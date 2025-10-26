import { create } from 'zustand';
import { WorkflowConfig, WorkflowState } from '../types';

interface WorkflowStore {
  config: WorkflowConfig | null;
  currentState: WorkflowState | null;
  isExecuting: boolean;
  
  setConfig: (config: WorkflowConfig) => void;
  setCurrentState: (state: WorkflowState) => void;
  setIsExecuting: (isExecuting: boolean) => void;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  config: null,
  currentState: null,
  isExecuting: false,
  
  setConfig: (config) => set({ config }),
  setCurrentState: (state) => set({ currentState: state }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  reset: () => set({ currentState: null, isExecuting: false }),
}));