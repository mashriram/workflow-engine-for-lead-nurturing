import React, { useMemo } from 'react';
import ReactFlow, {
  Edge,
  Background,
  Controls,
  MiniMap,
  Node,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { WorkflowConfig, WorkflowState } from '../../../core/types';
import { CustomNode } from './CustomNode';
import { useTheme } from '@/components/theme-provider';

interface WorkflowCanvasProps {
  config: WorkflowConfig;
  currentState?: WorkflowState<any>;
}

const nodeTypes = {
  custom: CustomNode,
};

export function WorkflowCanvas({ config, currentState }: WorkflowCanvasProps) {
  const { theme } = useTheme();

  const nodes = useMemo((): Node[] => {
    return config.nodes.map((node) => {
      const nodeState = currentState?.nodeStates[node.id];
      
      return {
        id: node.id,
        type: 'custom',
        position: node.position || { x: 0, y: 0 },
        data: {
          label: node.label,
          nodeType: node.type,
          status: nodeState?.status || 'pending',
          isActive: currentState?.currentNodeId === node.id,
        },
      };
    });
  }, [config.nodes, currentState]);
  
  const edges = useMemo((): Edge[] => {
    const strokeColor = theme === 'dark' ? '#94a3b8' : '#64748b';
    return config.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: currentState?.currentNodeId === edge.source,
      style: { stroke: strokeColor, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
      },
    }));
  }, [config.edges, currentState, theme]);
  
  return (
    <div className="w-full h-full bg-card">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
        className={theme}
      >
        <Background color={theme === 'dark' ? '#475569' : '#cbd5e1'} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} />
      </ReactFlow>
    </div>
  );
}
