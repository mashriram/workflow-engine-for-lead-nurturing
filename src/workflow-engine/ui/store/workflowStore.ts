import { create } from 'zustand';
import { WorkflowConfig, WorkflowState } from '../../core/types';

interface WorkflowStore {
  config: WorkflowConfig | null;
  currentState: WorkflowState<any> | null;
  isExecuting: boolean;
  selectedNodeId: string | null;
  
  setConfig: (config: WorkflowConfig) => void;
  setCurrentState: (state: WorkflowState<any>) => void;
  setIsExecuting: (isExecuting: boolean) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  config: null,
  currentState: null,
  isExecuting: false,
  selectedNodeId: null,
  
  setConfig: (config) => set({ config }),
  setCurrentState: (state) => set({ currentState: state }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  reset: () => set({ currentState: null, isExecuting: false, selectedNodeId: null }),
}));