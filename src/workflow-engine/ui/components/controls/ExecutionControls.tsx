import React from 'react';
import { Play, Pause, Square, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExecutionControlsProps {
  isExecuting: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function ExecutionControls({
  isExecuting,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
}: ExecutionControlsProps) {
  return (
    <div className="flex gap-2 p-4 bg-card rounded-lg shadow-md border dark:bg-black dark:text-amber-50">
      {!isExecuting && !isPaused ? (
        <Button
          onClick={onStart}
          className="flex-grow"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Workflow
        </Button>
      ) : (
        <>
          {!isPaused ? (
            <Button
              onClick={onPause}
              variant="secondary"
              className="flex-grow"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          ) : (
            <Button
              onClick={onResume}
              className="flex-grow"
            >
              <RotateCw className="w-5 h-5 mr-2" />
              Resume
            </Button>
          )}
          <Button
            onClick={onStop}
            variant="destructive"
            className="flex-grow"
          >
            <Square className="w-5 h-5 mr-2" />
            Stop
          </Button>
        </>
      )}
    </div>
  );
}