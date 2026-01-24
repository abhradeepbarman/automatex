import apps from '@repo/common/@apps';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Edge, Node } from '@xyflow/react';
import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import z from 'zod';
import ConnectBtn from '../common/connect-btn';
import DynamicForm from '../common/dynamic-form';
import { Button } from '../ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import type { ITriggerMetadata } from '@repo/common/types';

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
    connectionId: z.string().min(1, 'Connection is required'),
  });

  const form = useForm({
    resolver: zodResolver(triggerSheetSchema),
    defaultValues: {
      appId: '',
      triggerId: '',
      connectionId: '',
    },
  });

  const [appId, triggerId] = useWatch({
    control: form.control,
    name: ['appId', 'triggerId'],
  });

  const [connectionId] = useWatch({
    control: form.control,
    name: ['connectionId'],
  });

  const selectedTrigger = useMemo(() => {
    if (!appId || !triggerId) return null;
    const app = apps.find((app) => app.id === appId);
    return app?.triggers.find((trigger) => trigger.id === triggerId);
  }, [appId, triggerId]);

  const onSubmit = async (fieldData: any) => {
    const formData = form.getValues();

    // validate parent form fields manually
    if (!appId) {
      form.setError('appId', {
        type: 'required',
        message: 'App is required',
      });
      return;
    }

    if (!triggerId) {
      form.setError('triggerId', {
        type: 'required',
        message: 'Trigger is required',
      });
      return;
    }

    if (!connectionId) {
      form.setError('connectionId', {
        type: 'required',
        message: 'Connection is required',
      });
      return;
    }

    const triggerMetadata: ITriggerMetadata = {
      appId: formData.appId,
      triggerId: formData.triggerId,
      connectionId: formData.connectionId,
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
          ...triggerMetadata,
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
        if (!isOpen) form.reset();
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

        <form className="space-y-6 px-4">
          <Controller
            control={form.control}
            name={'appId'}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Choose an app</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('triggerId', '');
                    form.setValue('connectionId', '');
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an app" />
                  </SelectTrigger>
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
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {appId && (
            <Controller
              control={form.control}
              name="connectionId"
              render={({ fieldState }) => (
                <Field>
                  <FieldLabel>App connection</FieldLabel>
                  <FieldDescription className="pb-2">
                    Connect your account to use this trigger
                  </FieldDescription>
                  {!connectionId ? (
                    <ConnectBtn
                      appId={appId}
                      onAuthSuccess={(id: string) => {
                        form.setValue('connectionId', id);
                        form.clearErrors('connectionId');
                      }}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        form.setValue('connectionId', '');
                      }}
                    >
                      Disconnect
                    </Button>
                  )}
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          {appId && (
            <Controller
              control={form.control}
              name="triggerId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Choose an trigger</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a trigger" />
                    </SelectTrigger>
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
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
        </form>

        {/* Configure */}
        {selectedTrigger && selectedTrigger.fields.length > 0 && (
          <div className="mt-6 px-4">
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
      </SheetContent>
    </Sheet>
  );
};

export default TriggerSheet;
