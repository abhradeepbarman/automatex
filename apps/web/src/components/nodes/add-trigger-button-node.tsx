import type { NodeProps } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface AddTriggerButtonNodeProps extends NodeProps {
  data: {
    onAddClick: () => void;
  };
}

const AddTriggerButtonNode = ({ data }: AddTriggerButtonNodeProps) => {
  return (
    <div className="relative">
      <Button
        size="default"
        variant="outline"
        className="h-12 px-6 bg-background border-dashed border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50"
        onClick={data.onAddClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Trigger
      </Button>
    </div>
  );
};

export default AddTriggerButtonNode;
