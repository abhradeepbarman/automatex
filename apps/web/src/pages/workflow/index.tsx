import ActionNode from '@/components/nodes/action-node';
import AddActionButtonNode from '@/components/nodes/add-action-button-node';
import AddTriggerButtonNode from '@/components/nodes/add-trigger-button-node';
import TriggerNode from '@/components/nodes/trigger-node';
import ActionSheet from '@/components/sheets/action-sheet';
import TriggerSheet from '@/components/sheets/trigger-sheet';
import { Button } from '@/components/ui/button';
import workflowService from '@/services/workflow.service';
import { useQuery } from '@tanstack/react-query';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  addTriggerButton: AddTriggerButtonNode,
  addActionButton: AddActionButtonNode,
};

export default function Workflow() {
  const navigate = useNavigate();
  const { id: workflowId } = useParams();
  const { data } = useQuery({
    queryFn: () => workflowService.getWorkflow(workflowId!),
    queryKey: ['workflow', workflowId],
  });

  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'add-trigger-initial',
      type: 'addTriggerButton',
      position: { x: 100, y: 100 },
      data: {
        onAddClick: () => setTriggerSheetOpen(true),
      },
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [triggerSheetOpen, setTriggerSheetOpen] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [selectedSourceNodeId, setSelectedSourceNodeId] = useState<string>('');

  const onNodesChange: OnNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [setNodes],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [setEdges],
  );
  // const onConnect: OnConnect = useCallback(
  //   (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
  //   [setEdges],
  // );

  useEffect(() => {
    if (data && data?.steps.length > 0) {
      const lastStep = data.steps[data.steps.length - 1];
      const addActionButtonId = `add-action-${lastStep.id}`;

      setNodes([
        ...data.steps.map((step) => {
          return { ...step.metadata, id: step.id };
        }),
        {
          id: addActionButtonId,
          type: 'addActionButton',
          position: {
            x: lastStep.metadata.position.x + 350,
            y: lastStep.metadata.position.y,
          },
          data: {
            onAddClick: () => {
              setSelectedSourceNodeId(lastStep.id);
              setActionSheetOpen(true);
            },
          },
        },
      ]);

      let edgesArr: Edge[] = [];
      data.steps.forEach((step, i) => {
        if (i < data.steps.length - 1) {
          edgesArr.push({
            id: `${step.id}-${data.steps[i + 1].id}`,
            source: step.id,
            target: data.steps[i + 1].id,
          });
        }
      });

      setEdges([
        ...edgesArr,
        {
          id: `${lastStep.id}-${addActionButtonId}`,
          source: lastStep.id,
          target: addActionButtonId,
        },
      ]);
    }
  }, [data]);

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Header with Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Workflow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          // onConnect={onConnect}
          fitView
        >
          <MiniMap />
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <TriggerSheet
        open={triggerSheetOpen}
        onOpenChange={setTriggerSheetOpen}
        setNodes={setNodes}
        setEdges={setEdges}
        setSelectedSourceNodeId={setSelectedSourceNodeId}
        setActionSheetOpen={setActionSheetOpen}
      />

      <ActionSheet
        open={actionSheetOpen}
        onOpenChange={setActionSheetOpen}
        nodes={nodes}
        setNodes={setNodes}
        setEdges={setEdges}
        sourceNodeId={selectedSourceNodeId}
        setSelectedSourceNodeId={setSelectedSourceNodeId}
        setActionSheetOpen={setActionSheetOpen}
      />
    </div>
  );
}
