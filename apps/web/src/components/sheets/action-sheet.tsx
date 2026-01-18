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
import type { Edge, Node } from '@xyflow/react';
import ConnectBtn from '../common/connect-btn';
import { StepType } from '@repo/common/types';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface IActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  sourceNodeId: string;
  setSelectedSourceNodeId: Dispatch<SetStateAction<string>>;
  setActionSheetOpen: Dispatch<SetStateAction<boolean>>;
}

const ActionSheet = ({
  open,
  onOpenChange,
  setNodes,
  setEdges,
  sourceNodeId,
  setSelectedSourceNodeId,
  setActionSheetOpen,
}: IActionSheetProps) => {
  const actionSheetSchema = z.object({
    appId: z.string().min(1, 'Please select an app'),
    actionId: z.string().min(1, 'Please select an action'),
    auth: z.object({
      accessToken: z.string().min(1, 'Connection is required'),
      refreshToken: z.string().optional(),
      expiresIn: z.number().optional(),
    }),
  });

  const form = useForm({
    resolver: zodResolver(actionSheetSchema),
    defaultValues: {
      appId: '',
      actionId: '',
      auth: {
        accessToken: '',
        refreshToken: '',
        expiresIn: 0,
      },
    },
  });
  const [appId, actionId] = useWatch({
    control: form.control,
    name: ['appId', 'actionId'],
  });

  const [accessToken] = useWatch({
    control: form.control,
    name: ['auth.accessToken'],
  });

  const selectedAction = useMemo(() => {
    if (!appId || !actionId) return null;
    const app = apps.find((app) => app.id === appId);
    return app?.actions.find((action) => action.id === actionId);
  }, [appId, actionId]);

  const onSubmit = (fieldData: any) => {
    const formData = form.getValues();

    if (!formData.appId || !formData.actionId || !sourceNodeId) {
      console.error('Missing app, action, or source node');
      return;
    }

    if (!formData.auth.accessToken) {
      console.error('Missing authentication');
      return;
    }

    const actionData = {
      appId: formData.appId,
      actionId: formData.actionId,
      auth: formData.auth,
      fields: fieldData || {},
    };

    const actionNodeId = `action-${Date.now()}`;
    const addActionButtonId = `add-action-${actionNodeId}`;

    setNodes((prev) => {
      const sourceNode = prev.find((node) => node.id === sourceNodeId);

      if (!sourceNode) {
        console.error('Source node not found:', sourceNodeId);
        return prev;
      }

      const newX = sourceNode.position.x + 350;
      const newY = sourceNode.position.y;

      // Find and remove the specific add-action button connected to source
      const oldButtonId = `add-action-${sourceNodeId}`;
      const filteredNodes = prev.filter((n) => n.id !== oldButtonId);

      return [
        ...filteredNodes,
        {
          id: actionNodeId,
          type: 'actionNode',
          position: { x: newX, y: newY },
          data: {
            ...actionData,
          },
        },
        {
          id: addActionButtonId,
          type: 'addActionButton',
          position: { x: newX + 350, y: newY },
          data: {
            onAddClick: () => {
              setSelectedSourceNodeId(actionNodeId);
              setActionSheetOpen(true);
            },
          },
        },
      ];
    });

    setEdges((prev) => {
      const oldButtonId = `add-action-${sourceNodeId}`;
      const filteredEdges = prev.filter((e) => e.target !== oldButtonId);

      return [
        ...filteredEdges,
        {
          id: `${sourceNodeId}-${actionNodeId}`,
          source: sourceNodeId,
          target: actionNodeId,
        },
        {
          id: `${actionNodeId}-${addActionButtonId}`,
          source: actionNodeId,
          target: addActionButtonId,
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
                      {...form.register('appId')}
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
                        {...form.register('actionId')}
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

              {/* Connection */}
              {selectedAction && (
                <FormField
                  control={form.control}
                  name="auth.accessToken"
                  render={({ fieldState }) => (
                    <FormItem>
                      <div className="mt-6">
                        <div className="mb-4">
                          <h3 className="text-sm font-medium">
                            App connection
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Connect your account to use this action
                          </p>
                          {!accessToken ? (
                            <ConnectBtn
                              appId={appId}
                              stepType={StepType.ACTION}
                              stepId={actionId}
                              onAuthSuccess={(authData) => {
                                form.setValue(
                                  'auth.accessToken',
                                  authData.accessToken,
                                );
                                form.setValue(
                                  'auth.refreshToken',
                                  authData.refreshToken || '',
                                );
                                form.setValue(
                                  'auth.expiresIn',
                                  authData.expiresIn || 0,
                                );
                              }}
                            />
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                form.setValue('auth.accessToken', '', {
                                  shouldValidate: true,
                                });
                                form.setValue('auth.refreshToken', '');
                                form.setValue('auth.expiresIn', 0);
                              }}
                            >
                              Disconnect
                            </Button>
                          )}
                        </div>
                      </div>
                      {fieldState.error && (
                        <p className="text-sm text-destructive">
                          {fieldState.error.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>

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

          {/* Submit button for actions with no fields */}
          {selectedAction && selectedAction.fields.length === 0 && (
            <div className="mt-6">
              <Button onClick={() => onSubmit({})} className="w-full">
                Add action
              </Button>
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
