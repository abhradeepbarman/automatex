import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { INITIAL_X, INITIAL_Y, NODE_SPACING } from '@/constants/workflow';
import stepService from '@/services/step.service';
import { useMutation } from '@tanstack/react-query';
import type { Edge, Node } from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeIdToDelete: string | null;
  nodes: Node[];
  edges: Edge[];
  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  setSelectedSourceNodeId: Dispatch<SetStateAction<string>>;
  setActionSheetOpen: Dispatch<SetStateAction<boolean>>;
  setTriggerSheetOpen: Dispatch<SetStateAction<boolean>>;
}

const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  nodeIdToDelete,
  nodes,
  edges,
  setNodes,
  setEdges,
  setSelectedSourceNodeId,
  setActionSheetOpen,
  setTriggerSheetOpen,
}: DeleteConfirmationDialogProps) => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (stepId: string) => stepService.deleteStep(stepId),
  });

  const confirmDelete = async () => {
    if (!nodeIdToDelete) return;

    try {
      const response = await mutateAsync(nodeIdToDelete);

      if (!response) {
        toast.error('Failed to delete node', {
          description: 'The node could not be deleted from the database.',
        });
        return;
      }

      // Find the index of the node to delete
      const nodeIndex = nodes.findIndex((n) => n.id === nodeIdToDelete);
      if (nodeIndex === -1) {
        toast.error('Node not found', {
          description: 'The node could not be found in the workflow.',
        });
        return;
      }

      // Remove the node and all nodes after it
      const nodesToKeep = nodes.slice(0, nodeIndex);

      // Filter edges to only keep those connected to remaining nodes
      const remainingNodeIds = new Set(nodesToKeep.map((n) => n.id));
      const edgesToKeep = edges.filter(
        (e) => remainingNodeIds.has(e.source) && remainingNodeIds.has(e.target),
      );

      // Add the "add action" button after the last remaining node
      if (nodesToKeep.length > 0) {
        const lastNode = nodesToKeep[nodesToKeep.length - 1];
        const addActionButtonId = `add-action-${lastNode.id}`;

        nodesToKeep.push({
          id: addActionButtonId,
          type: 'addActionButton',
          position: {
            x: lastNode.position.x + NODE_SPACING,
            y: lastNode.position.y,
          },
          data: {
            onAddClick: () => {
              setSelectedSourceNodeId(lastNode.id);
              setActionSheetOpen(true);
            },
          },
        });

        edgesToKeep.push({
          id: `${lastNode.id}-${addActionButtonId}`,
          source: lastNode.id,
          target: addActionButtonId,
        });
      } else {
        // If no nodes left, add the initial trigger button
        nodesToKeep.push({
          id: 'add-trigger-initial',
          type: 'addTriggerButton',
          position: { x: INITIAL_X, y: INITIAL_Y },
          data: {
            onAddClick: () => setTriggerSheetOpen(true),
          },
        });
      }

      // Update UI only after successful backend deletion
      setNodes(nodesToKeep);
      setEdges(edgesToKeep);

      // Show success message
      toast.success('Node deleted successfully', {
        description: 'The node and all subsequent nodes have been removed.',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete node:', error);
      toast.error('Failed to delete node', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred. Please try again.',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this node?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete the selected node and all nodes that come after it
            in the workflow. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={confirmDelete}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;
