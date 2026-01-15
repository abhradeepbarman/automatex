import TriggerNode from '@/components/nodes/trigger-node';
import AddTriggerButtonNode from '@/components/nodes/add-trigger-button-node';
import AddActionButtonNode from '@/components/nodes/add-action-button-node';
import TriggerSheet from '@/components/sheets/trigger-sheet';
import ActionSheet from '@/components/sheets/action-sheet';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from 'react';

const nodeTypes = {
  triggerNode: TriggerNode,
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
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  useEffect(() => {
    const triggerNodes = nodes.filter((n) => n.type === 'triggerNode');
    const addTriggerButtons = nodes.filter(
      (n) => n.type === 'addTriggerButton',
    );

    // If we have a trigger node and still have the add trigger button, remove it
    if (triggerNodes.length > 0 && addTriggerButtons.length > 0) {
      setNodes((prev) => prev.filter((n) => n.type !== 'addTriggerButton'));
    }

    // Add "Add Action" button after trigger node if it doesn't exist
    if (triggerNodes.length > 0) {
      const lastTrigger = triggerNodes[triggerNodes.length - 1];
      const hasActionButton = nodes.some(
        (n) =>
          n.type === 'addActionButton' &&
          edges.some((e) => e.source === lastTrigger.id && e.target === n.id),
      );

      if (!hasActionButton) {
        const buttonId = `add-action-${lastTrigger.id}`;

        setNodes((prev) => [
          ...prev,
          {
            id: buttonId,
            type: 'addActionButton',
            position: {
              x: lastTrigger.position.x + 350,
              y: lastTrigger.position.y,
            },
            data: {
              onAddClick: () => {
                setSelectedSourceNodeId(lastTrigger.id);
                setActionSheetOpen(true);
              },
            },
          },
        ]);

        setEdges((prev) => [
          ...prev,
          {
            id: `edge-${lastTrigger.id}-${buttonId}`,
            source: lastTrigger.id,
            target: buttonId,
          },
        ]);
      }
    }
  }, [nodes.filter((n) => n.type === 'triggerNode').length]);

  useEffect(() => {
    const actionNodes = nodes.filter((n) => n.type === 'actionNode');

    if (actionNodes.length > 0 && selectedSourceNodeId) {
      const lastAction = actionNodes[actionNodes.length - 1];

      // Find and remove the button node that was connected to the source
      const buttonToRemove = nodes.find(
        (n) =>
          n.type === 'addActionButton' &&
          edges.some(
            (e) => e.source === selectedSourceNodeId && e.target === n.id,
          ),
      );

      if (buttonToRemove) {
        setNodes((prev) => prev.filter((n) => n.id !== buttonToRemove.id));

        setEdges((prev) => prev.filter((e) => e.target !== buttonToRemove.id));

        const edgeExists = edges.some(
          (e) =>
            e.source === selectedSourceNodeId && e.target === lastAction.id,
        );

        if (!edgeExists) {
          setEdges((prev) => [
            ...prev,
            {
              id: `edge-${selectedSourceNodeId}-${lastAction.id}`,
              source: selectedSourceNodeId,
              target: lastAction.id,
            },
          ]);
        }

        // Add new "Add Action" button after the action node
        const newButtonId = `add-action-${lastAction.id}`;
        const buttonExists = nodes.some((n) => n.id === newButtonId);

        if (!buttonExists) {
          setNodes((prev) => [
            ...prev,
            {
              id: newButtonId,
              type: 'addActionButton',
              position: {
                x: lastAction.position.x + 350,
                y: lastAction.position.y,
              },
              data: {
                onAddClick: () => {
                  setSelectedSourceNodeId(lastAction.id);
                  setActionSheetOpen(true);
                },
              },
            },
          ]);

          setEdges((prev) => [
            ...prev,
            {
              id: `edge-${lastAction.id}-${newButtonId}`,
              source: lastAction.id,
              target: newButtonId,
            },
          ]);
        }
      }
    }
  }, [nodes.filter((n) => n.type === 'actionNode').length]);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
      />

      <ActionSheet
        open={actionSheetOpen}
        onOpenChange={setActionSheetOpen}
        setNodes={setNodes}
        sourceNodeId={selectedSourceNodeId}
      />
    </div>
  );
}
