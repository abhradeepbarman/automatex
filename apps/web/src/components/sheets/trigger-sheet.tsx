import apps from '@repo/common/@apps';
import { StepType } from '@repo/common/types';

import type { Edge, Node } from '@xyflow/react';
import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import DynamicForm from '../common/dynamic-form';
import ConnectBtn from '../common/connect-btn';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface ITriggerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  setSelectedSourceNodeId: Dispatch<SetStateAction<string>>;
  setActionSheetOpen: Dispatch<SetStateAction<boolean>>;
}

const TriggerSheet = ({
  open,
  onOpenChange,
  setNodes,
  setEdges,
  setSelectedSourceNodeId,
  setActionSheetOpen,
}: ITriggerSheetProps) => {
  const triggerSheetSchema = z.object({
    appId: z.string().min(1, 'Please select an app'),
    triggerId: z.string().min(1, 'Please select a trigger'),
    auth: z.object({
      accessToken: z.string().min(1, 'Connection is required'),
      refreshToken: z.string().optional(),
      expiresIn: z.number().optional(),
    }),
  });

  const form = useForm({
    resolver: zodResolver(triggerSheetSchema),
    defaultValues: {
      appId: '',
      triggerId: '',
      auth: {
        accessToken: '',
        refreshToken: '',
        expiresIn: 0,
      },
    },
  });

  const [appId, triggerId] = useWatch({
    control: form.control,
    name: ['appId', 'triggerId'],
  });

  const [accessToken] = useWatch({
    control: form.control,
    name: ['auth.accessToken'],
  });

  const selectedTrigger = useMemo(() => {
    if (!appId || !triggerId) return null;
    const app = apps.find((app) => app.id === appId);
    return app?.triggers.find((trigger) => trigger.id === triggerId);
  }, [appId, triggerId]);

  const onSubmit = async (fieldData: any) => {
    const formData = form.getValues();

    if (!formData.appId || !formData.triggerId) {
      console.error('Missing app or trigger selection');
      return;
    }

    if (!formData.auth.accessToken) {
      console.error('Missing authentication');
      return;
    }

    const triggerData = {
      appId: formData.appId,
      triggerId: formData.triggerId,
      auth: formData.auth,
      fields: fieldData || {},
    };

    const triggerNodeId = `trigger-${Date.now()}`;
    const addActionButtonId = `add-action-${triggerNodeId}`;

    setNodes((prev) => [
      ...prev.filter((n) => n.type !== 'addTriggerButton'),
      {
        id: triggerNodeId,
        type: 'triggerNode',
        position: { x: 0, y: 0 },
        data: {
          ...triggerData,
        },
      },
      {
        id: addActionButtonId,
        type: 'addActionButton',
        position: { x: 350, y: 0 },
        data: {
          onAddClick: () => {
            setSelectedSourceNodeId(triggerNodeId);
            setActionSheetOpen(true);
          },
        },
      },
    ]);

    setEdges((prev) => [
      ...prev,
      {
        id: `${triggerNodeId}-${addActionButtonId}`,
        source: triggerNodeId,
        target: addActionButtonId,
      },
    ]);

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
          <SheetTitle>Add trigger</SheetTitle>
          <SheetDescription>
            Choose a trigger to add to your workflow
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
                        form.setValue('triggerId', '');
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
                          .filter((app) => app.triggers.length > 0)
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
                  name="triggerId"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Choose an trigger</Label>
                      <Select
                        onValueChange={field.onChange}
                        {...form.register('triggerId')}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a trigger" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {apps
                            .find((app) => app.id === appId)
                            ?.triggers.map((trigger) => (
                              <SelectItem key={trigger.id} value={trigger.id}>
                                {trigger.name}
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
              {selectedTrigger && (
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
                            Connect your account to use this trigger
                          </p>
                          {!accessToken ? (
                            <ConnectBtn
                              appId={appId}
                              stepType={StepType.TRIGGER}
                              stepId={triggerId}
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
          {selectedTrigger && selectedTrigger.fields.length > 0 && (
            <div className="mt-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium">Configure trigger</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTrigger.description}
                </p>
              </div>
              <DynamicForm
                fields={selectedTrigger.fields}
                onSubmit={onSubmit}
                submitLabel="Add trigger"
              />
            </div>
          )}

          {selectedTrigger && selectedTrigger.fields.length === 0 && (
            <div className="mt-6">
              <Button onClick={onSubmit} className="w-full">
                Add trigger
              </Button>
            </div>
          )}
        </div>

        {!selectedTrigger && (
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

export default TriggerSheet;
