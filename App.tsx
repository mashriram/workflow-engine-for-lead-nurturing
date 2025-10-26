import React, { useEffect, useState } from 'react';
import { WorkflowCanvas } from './src/workflow-engine/ui/components/workflow/WorkflowCanvas';
import { ExecutionControls } from './src/workflow-engine/ui/components/controls/ExecutionControls';
import { StateViewer } from './src/workflow-engine/ui/components/state/StateViewer';
import { useWorkflowEngine } from './src/workflow-engine/ui/hooks/useWorkflowEngine';
import { useWorkflowStore } from './src/workflow-engine/ui/store/workflowStore';
import { WorkflowConfig } from './src/workflow-engine/core/types';
import { LeadData } from './src/app-specific/lead-nurturing/types';
import { ModeToggle } from './src/components/theme-toggle';

type LoadingStatus = 'loading' | 'loaded' | 'error';

function App() {
  const { config, currentState, isExecuting, setConfig } = useWorkflowStore();
  const { startWorkflow, pauseWorkflow, resumeWorkflow, stopWorkflow } =
    useWorkflowEngine<LeadData>(config);
  
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/config/lead-nurturing.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load workflow config (Status: ${response.status})`);
        }
        return response.json();
      })
      .then(data => {
        setConfig(data as WorkflowConfig);
        setLoadingStatus('loaded');
      })
      .catch(err => {
        console.error("Error fetching workflow configuration:", err);
        setError(err.message);
        setLoadingStatus('error');
      });
  }, [setConfig]);

  const handleStart = () => {
    const mockLeadData: LeadData = {
      id: `lead_${Date.now()}`,
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+1-555-123-4567',
      status: 'new',
      source: 'website',
      classification: undefined,
      customFields: {},
      communicationHistory: [],
    };

    startWorkflow(mockLeadData);
  };

  if (loadingStatus === 'loading') {
    return <div className="p-8 text-center text-muted-foreground">Loading Workflow...</div>;
  }

  if (loadingStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="p-8 text-center text-destructive-foreground bg-destructive rounded-lg shadow-md border border-destructive">
            <h2 className="text-xl font-bold">Failed to load workflow</h2>
            <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!config) {
     return <div className="p-8 text-center text-muted-foreground">Initializing...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-8 flex flex-col">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lead Nurturing Workflow Engine</h1>
          <p className="text-muted-foreground mt-1">{config.description}</p>
        </div>
        <ModeToggle />
      </header>
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg shadow-lg overflow-hidden border">
          <WorkflowCanvas config={config} currentState={currentState ?? undefined} />
        </div>
        <aside className="space-y-6">
          <ExecutionControls
            isExecuting={isExecuting}
            isPaused={currentState?.status === 'paused'}
            onStart={handleStart}
            onPause={pauseWorkflow}
            onResume={resumeWorkflow}
            onStop={stopWorkflow}
          />
          <StateViewer state={currentState} />
        </aside>
      </main>
    </div>
  );
}

export default App;
