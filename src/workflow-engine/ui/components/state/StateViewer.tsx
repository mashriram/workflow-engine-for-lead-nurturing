import React from 'react';
import { WorkflowState } from '../../../core/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useWorkflowStore } from '../../store/workflowStore';
import { Button } from '@/components/ui/button';

interface StateViewerProps {
  state: WorkflowState<any> | null;
}

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-start py-1">
    <span className="font-medium text-muted-foreground flex-shrink-0 pr-2">{label}:</span> 
    <span className="text-foreground text-right truncate">{value}</span>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const colorClasses: Record<string, string> = {
        idle: 'bg-gray-200 text-gray-800',
        running: 'bg-blue-200 text-blue-800 animate-pulse',
        paused: 'bg-yellow-200 text-yellow-800',
        completed: 'bg-green-200 text-green-800',
        failed: 'bg-red-200 text-red-800',
        cancelled: 'bg-orange-200 text-orange-800',
    };
    const color = colorClasses[status] || 'bg-gray-200 text-gray-800';

    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>{status}</span>;
}

export function StateViewer({ state }: StateViewerProps) {
  const { selectedNodeId, setSelectedNodeId } = useWorkflowStore();

  if (!state) {
    return (
      <div className="p-4 bg-card rounded-lg shadow-md border">
        <h3 className="font-semibold mb-2 text-card-foreground">Workflow State</h3>
        <p className="text-muted-foreground">No active execution. Click 'Start' to begin.</p>
      </div>
    );
  }

  const history = selectedNodeId 
    ? state.executionHistory.filter(entry => entry.nodeId === selectedNodeId)
    : state.executionHistory;
  
  return (
    <div className="p-4 bg-card rounded-lg shadow-md border space-y-4 text-sm">
      <div className="pb-3 border-b">
        <h3 className="font-semibold mb-2 text-card-foreground">Execution Status</h3>
        <div className="space-y-1">
          <InfoRow label="Status" value={<StatusBadge status={state.status} />} />
          <InfoRow label="Current Node" value={state.currentNodeId || 'None'} />
          <InfoRow label="Execution ID" value={<span className="font-mono text-xs break-all">{state.executionId}</span>} />
        </div>
      </div>
      
      <div className="pb-3 border-b">
        <h4 className="font-semibold mb-2 text-card-foreground">Context Data</h4>
        <pre className="text-xs bg-muted text-muted-foreground p-2 rounded-md max-h-40 overflow-auto">
          {JSON.stringify(state.contextData, null, 2)}
        </pre>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-card-foreground">
            {selectedNodeId ? `History for ${selectedNodeId}` : 'Execution History'}
          </h4>
          {selectedNodeId && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedNodeId(null)}>
              Show All
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
          {history.length === 0 ? (
             <p className="text-xs text-muted-foreground">
               {selectedNodeId ? 'No history for this node.' : 'No history yet.'}
             </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {[...history].reverse().map((entry, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full text-xs">
                      <span className="font-medium text-foreground">{entry.action}</span>
                      <span className={entry.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                        {entry.status}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-xs text-muted-foreground space-y-2">
                      <div><strong>Node ID:</strong> {entry.nodeId}</div>
                      <div><strong>Timestamp:</strong> {new Date(entry.timestamp).toLocaleString()}</div>
                      {entry.duration && <div><strong>Duration:</strong> {entry.duration}ms</div>}
                      {entry.input && (
                        <div>
                          <strong>Input:</strong>
                          <pre className="text-xs bg-muted/50 p-2 rounded-md max-h-40 overflow-auto mt-1">
                            {JSON.stringify(entry.input, null, 2)}
                          </pre>
                        </div>
                      )}
                      {entry.output && (
                        <div>
                          <strong>Output:</strong>
                          <pre className="text-xs bg-muted/50 p-2 rounded-md max-h-40 overflow-auto mt-1">
                            {JSON.stringify(entry.output, null, 2)}
                          </pre>
                        </div>
                      )}
                      {entry.details && (
                        <div>
                          <strong>Details:</strong>
                          <pre className="text-xs bg-muted/50 p-2 rounded-md max-h-40 overflow-auto mt-1">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}
