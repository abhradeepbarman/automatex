import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface AddActionButtonNodeProps extends NodeProps {
  data: {
    onAddClick: () => void;
  };
}

const AddActionButtonNode = ({ data }: AddActionButtonNodeProps) => {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="h-2.5! w-2.5! bg-primary!"
      />

      <Button
        size="sm"
        variant="outline"
        className="h-10 px-4 bg-background border-dashed border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50"
        onClick={data.onAddClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Action
      </Button>
    </div>
  );
};

export default AddActionButtonNode;
