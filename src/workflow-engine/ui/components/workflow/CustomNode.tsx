import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  PlayCircle, 
  StopCircle, 
  CheckCircle, 
  Clock,
  GitBranch,
  Mail,
  Phone,
  MessageSquareText
} from 'lucide-react';
import { NodeType } from '../../../core/types';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useWorkflowStore } from '../../store/workflowStore';

interface CustomNodeData {
  label: string;
  nodeType: NodeType;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  isActive?: boolean;
}

const nodeIcons: Record<NodeType, React.ReactElement> = {
    start: <PlayCircle className="w-5 h-5" />,
    end: <StopCircle className="w-5 h-5" />,
    action: <CheckCircle className="w-5 h-5" />,
    wait: <Clock className="w-5 h-5" />,
    decision: <GitBranch className="w-5 h-5" />,
    parallel: <CheckCircle className="w-5 h-5" />, // Placeholder
    merge: <CheckCircle className="w-5 h-5" /> // Placeholder
};


export function CustomNode({ id, data }: NodeProps<CustomNodeData>) {
  const { selectedNodeId, setSelectedNodeId } = useWorkflowStore();

  const getIcon = () => {
     // Keep some app-specific icons for demonstration, but default to generic ones
     if (data.label.toLowerCase().includes('email')) return <Mail className="w-5 h-5" />;
     if (data.label.toLowerCase().includes('call')) return <Phone className="w-5 h-5" />;
     if (data.label.toLowerCase().includes('sms')) return <MessageSquareText className="w-5 h-5" />;
     return nodeIcons[data.nodeType] || <CheckCircle className="w-5 h-5" />;
  };
  
  const getStatusClasses = () => {
    switch (data.status) {
      case 'completed':
        return 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300';
      case 'running':
        return 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-300';
      case 'failed':
        return 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300';
      case 'pending':
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300';
    }
  };

  const isSelected = selectedNodeId === id;
  
  return (
    <Card
      onClick={() => setSelectedNodeId(id)}
      className={cn(
        "min-w-[180px] transition-all duration-300 cursor-pointer",
        getStatusClasses(),
        data.isActive ? 'ring-4 ring-blue-400 ring-opacity-60 shadow-xl' : 'shadow-md',
        isSelected ? 'ring-4 ring-yellow-400 ring-opacity-60 shadow-xl' : ''
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div>
          <CardTitle className="text-sm font-bold">{data.label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xs opacity-75 capitalize">{data.nodeType}</div>
      </CardContent>
      
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </Card>
  );
}
