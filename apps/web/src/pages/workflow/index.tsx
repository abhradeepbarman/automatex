import ActionNode from '@/components/nodes/action-node';
import AddActionButtonNode from '@/components/nodes/add-action-button-node';
import AddTriggerButtonNode from '@/components/nodes/add-trigger-button-node';
import TriggerNode from '@/components/nodes/trigger-node';
import ActionSheet from '@/components/sheets/action-sheet';
import TriggerSheet from '@/components/sheets/trigger-sheet';
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
import { useCallback, useState } from 'react';

const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  addTriggerButton: AddTriggerButtonNode,
  addActionButton: AddActionButtonNode,
};

export default function Workflow() {
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

  return (
    <div className="w-screen h-screen flex justify-center items-center">
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
        setNodes={setNodes}
        setEdges={setEdges}
        sourceNodeId={selectedSourceNodeId}
        setSelectedSourceNodeId={setSelectedSourceNodeId}
        setActionSheetOpen={setActionSheetOpen}
      />
    </div>
  );
}
