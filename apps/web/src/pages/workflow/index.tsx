import TriggerNode from '@/components/nodes/trigger-node';
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
  addActionButton: AddActionButtonNode,
};

export default function Workflow() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
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

  // Automatically add "Add Action" button node after trigger/action nodes
  useEffect(() => {
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];

      // Check if last node is a trigger or action node (not a button node)
      if (lastNode.type === 'triggerNode' || lastNode.type === 'actionNode') {
        // Check if there's already a button node connected to this node
        const hasButtonNode = nodes.some(
          (node) =>
            node.type === 'addActionButton' &&
            edges.some(
              (edge) => edge.source === lastNode.id && edge.target === node.id,
            ),
        );

        if (!hasButtonNode) {
          const buttonNodeId = `add-button-${lastNode.id}`;

          // Add button node
          setNodes((prev) => [
            ...prev,
            {
              id: buttonNodeId,
              type: 'addActionButton',
              position: {
                x: lastNode.position.x + 350,
                y: lastNode.position.y,
              },
              data: {
                onAddClick: () => {
                  setSelectedSourceNodeId(lastNode.id);
                  setActionSheetOpen(true);
                },
              },
            },
          ]);

          // Add edge connecting to button node
          setEdges((prev) => [
            ...prev,
            {
              id: `edge-${lastNode.id}-${buttonNodeId}`,
              source: lastNode.id,
              target: buttonNodeId,
            },
          ]);
        }
      }
    }
  }, [nodes.length]);

  // When action node is added, remove the button node and connect properly
  useEffect(() => {
    if (nodes.length > 1) {
      const lastNode = nodes[nodes.length - 1];

      // If the last node is an action node
      if (lastNode.type === 'actionNode' && selectedSourceNodeId) {
        // Remove the button node that was connected to the source
        const buttonNodeToRemove = nodes.find(
          (node) =>
            node.type === 'addActionButton' &&
            edges.some(
              (edge) =>
                edge.source === selectedSourceNodeId && edge.target === node.id,
            ),
        );

        if (buttonNodeToRemove) {
          // Remove button node and its edge
          setNodes((prev) =>
            prev.filter((node) => node.id !== buttonNodeToRemove.id),
          );
          setEdges((prev) =>
            prev.filter(
              (edge) =>
                !(
                  edge.source === selectedSourceNodeId &&
                  edge.target === buttonNodeToRemove.id
                ),
            ),
          );

          // Add edge from source to new action node
          setEdges((prev) => [
            ...prev,
            {
              id: `edge-${selectedSourceNodeId}-${lastNode.id}`,
              source: selectedSourceNodeId,
              target: lastNode.id,
            },
          ]);
        }
      }
    }
  }, [nodes.length]);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {!nodes.length ? (
        <TriggerSheet setNodes={setNodes} />
      ) : (
        <>
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

          <ActionSheet
            open={actionSheetOpen}
            onOpenChange={setActionSheetOpen}
            setNodes={setNodes}
            sourceNodeId={selectedSourceNodeId}
          />
        </>
      )}
    </div>
  );
}
