import { useForm, useWatch } from 'react-hook-form';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import apps from '@repo/common/@apps';
import { Label } from '../ui/label';
import DynamicForm from '../common/dynamic-form';
import { useMemo, type Dispatch, type SetStateAction } from 'react';
import type { Node } from '@xyflow/react';

interface IActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setNodes: Dispatch<SetStateAction<Node[]>>;
  sourceNodeId: string;
}

const ActionSheet = ({
  open,
  onOpenChange,
  setNodes,
  sourceNodeId,
}: IActionSheetProps) => {
  const form = useForm({
    defaultValues: {
      appId: '',
      actionId: '',
    },
  });
  const [appId, actionId] = useWatch({
    control: form.control,
    name: ['appId', 'actionId'],
  });

  const selectedAction = useMemo(() => {
    if (!appId || !actionId) return null;
    const app = apps.find((app) => app.id === appId);
    return app?.actions.find((action) => action.id === actionId);
  }, [appId, actionId]);

  const onSubmit = (fieldData: any) => {
    const actionData = {
      appId,
      actionId,
      fields: fieldData,
    };

    setNodes((prev) => {
      const sourceNode = prev.find((node) => node.id === sourceNodeId);
      const newX = sourceNode ? sourceNode.position.x + 350 : 350;
      const newY = sourceNode ? sourceNode.position.y : 0;

      return [
        ...prev,
        {
          id: `action-${Date.now()}`,
          type: 'actionNode',
          position: { x: newX, y: newY },
          data: {
            ...actionData,
          },
        },
      ];
    });

    onOpenChange(false);
    form.reset();
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          form.reset();
        }
        onOpenChange(isOpen);
      }}
    >
      <SheetContent className="overflow-y-auto pb-5">
        <SheetHeader>
          <SheetTitle>Add action</SheetTitle>
          <SheetDescription>
            Choose an action to add to your workflow
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name={'appId'}
                render={({ field }) => (
                  <FormItem>
                    <Label>Choose an app</Label>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('actionId', '');
                      }}
                      {...form.register('appId', {
                        required: {
                          value: true,
                          message: 'Please select an app',
                        },
                      })}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an app" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {apps
                          .filter((app) => app.actions.length > 0)
                          .map((app) => (
                            <SelectItem key={app.id} value={app.id}>
                              {app.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {appId && (
                <FormField
                  control={form.control}
                  name="actionId"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Choose an action</Label>
                      <Select
                        onValueChange={field.onChange}
                        {...form.register('actionId', {
                          required: {
                            value: true,
                            message: 'Please select an action',
                          },
                        })}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an action" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {apps
                            .find((app) => app.id === appId)
                            ?.actions.map((action) => (
                              <SelectItem key={action.id} value={action.id}>
                                {action.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>

          {/* Connection */}
          {selectedAction && (
            <div className="mt-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium">App connection</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your account to use this action
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // TODO: Implement OAuth flow
                    console.log('Connect app clicked for:', appId);
                  }}
                >
                  Connect app
                </Button>
              </div>
            </div>
          )}

          {/* Configure */}
          {selectedAction && selectedAction.fields.length > 0 && (
            <div className="mt-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium">Configure action</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedAction.description}
                </p>
              </div>
              <DynamicForm
                fields={selectedAction.fields}
                onSubmit={onSubmit}
                submitLabel="Add action"
              />
            </div>
          )}
        </div>

        {!selectedAction && (
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ActionSheet;
