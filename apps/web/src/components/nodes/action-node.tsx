import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import apps from '@repo/common/@apps';

type IActionNodeData = Node<
  {
    appId: string;
    actionId: string;
    fields: any;
  },
  'actionNode'
>;

const ActionNode = ({ data }: NodeProps<IActionNodeData>) => {
  const appDetails = apps.filter((app) => app.id === data.appId)[0];
  const actionDetails = apps
    .filter((app) => app.id === data.appId)[0]
    ?.actions.filter((action) => action.id === data.actionId)[0];

  return (
    <div className="relative min-w-65 rounded-md border bg-card shadow-sm">
      {/* Header */}
      <div className="px-3 py-2 border-b bg-muted/20">
        <p className="text-sm font-medium">
          {appDetails?.name || 'Unknown App'}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Action</p>
      </div>

      {/* Content */}
      <div className="px-3 py-2 space-y-1">
        <p className="text-sm font-medium">
          {actionDetails?.name || 'Unknown Action'}
        </p>
        {actionDetails?.description && (
          <p className="text-xs text-muted-foreground">
            {actionDetails.description}
          </p>
        )}
      </div>

      {/* Footer */}
      {data.fields && Object.keys(data.fields).length > 0 && (
        <div className="px-3 py-1.5 border-t bg-muted/10">
          <p className="text-xs text-muted-foreground">
            {Object.keys(data.fields).length} field
            {Object.keys(data.fields).length !== 1 ? 's' : ''} configured
          </p>
        </div>
      )}

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="h-2.5! w-2.5! bg-primary!"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="h-2.5! w-2.5! bg-primary!"
      />
    </div>
  );
};

export default ActionNode;
