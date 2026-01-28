import stepService from '@/services/step.service';
import { zodResolver } from '@hookform/resolvers/zod';
import apps from '@repo/common/@apps';
import { StepType } from '@repo/common/types';
import { useMutation } from '@tanstack/react-query';
import type { Edge, Node } from '@xyflow/react';
import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import z from 'zod';
import { NODE_SPACING } from '@/constants/workflow';
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

interface IActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: Node[];
  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  sourceNodeId: string;
  setSelectedSourceNodeId: Dispatch<SetStateAction<string>>;
  setActionSheetOpen: Dispatch<SetStateAction<boolean>>;
  handleEditClick: () => void;
  handleDeleteClick: (nodeId: string) => void;
}

const ActionSheet = ({
  open,
  onOpenChange,
  nodes,
  setNodes,
  setEdges,
  sourceNodeId,
  setSelectedSourceNodeId,
  setActionSheetOpen,
  handleEditClick,
  handleDeleteClick,
}: IActionSheetProps) => {
  const { id: workflowId } = useParams();
  const actionSheetSchema = z.object({
    appId: z.string().min(1, 'Please select an app'),
    actionId: z.string().min(1, 'Please select an action'),
    connectionId: z.string().min(1, 'Connection is required'),
  });

  const form = useForm({
    resolver: zodResolver(actionSheetSchema),
    defaultValues: {
      appId: '',
      actionId: '',
      connectionId: '',
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['create-action'],
    mutationFn: (metadata: Node) =>
      stepService.addStep(
        workflowId!,
        appId,
        nodes.length,
        StepType.ACTION,
        connectionId,
        metadata,
      ),
  });

  const [appId, actionId] = useWatch({
    control: form.control,
    name: ['appId', 'actionId'],
  });

  const [connectionId] = useWatch({
    control: form.control,
    name: ['connectionId'],
  });

  const selectedAction = useMemo(() => {
    if (!appId || !actionId) return null;
    const app = apps.find((a) => a.id === appId);
    return app?.actions.find((a) => a.id === actionId);
  }, [appId, actionId]);

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

    if (!formData.actionId) {
      form.setError('actionId', {
        type: 'required',
        message: 'Action is required',
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

    // Find the source node to calculate position
    const sourceNode = nodes.find((n) => n.id === sourceNodeId);
    if (!sourceNode) {
      console.error('Source node not found');
      return;
    }

    const nodeDetails: Node = {
      id: '',
      type: 'actionNode',
      position: {
        x: sourceNode.position.x + NODE_SPACING,
        y: sourceNode.position.y,
      },
      data: {
        index: nodes.length,
        appId: formData.appId,
        actionId: formData.actionId,
        fields: fieldData || {},
      },
    };

    const { id } = await mutateAsync(nodeDetails);

    const actionNodeId = `action-${id}`;
    nodeDetails.id = actionNodeId;
    const addActionButtonId = `add-action-${actionNodeId}`;

    setNodes((prev) => {
      const oldButtonId = `add-action-${sourceNodeId}`;
      const filtered = prev.filter((n) => n.id !== oldButtonId);

      return [
        ...filtered,
        {
          ...nodeDetails,
          data: {
            ...nodeDetails.data,
            handleEditClick: () => handleEditClick(),
            handleDeleteClick: () => handleDeleteClick(actionNodeId),
          },
        },
        {
          id: addActionButtonId,
          type: 'addActionButton',
          position: {
            x: nodeDetails.position.x + NODE_SPACING,
            y: nodeDetails.position.y,
          },
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
      const filtered = prev.filter((e) => e.target !== oldButtonId);

      return [
        ...filtered,
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
        if (!isOpen) form.reset();
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
                    form.setValue('actionId', '');
                    form.setValue('connectionId', '');
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an app" />
                  </SelectTrigger>
                  <SelectContent>
                    {apps
                      .filter((app) => app.actions.length > 0)
                      .map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                          <div className="flex items-center gap-2">
                            {app.icon && (
                              <img
                                src={app.icon}
                                alt={app.name}
                                className="h-5 w-5 object-contain"
                              />
                            )}
                            <span>{app.name}</span>
                          </div>
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
              name="actionId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Choose an action</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('connectionId', '');
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
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
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
        </form>

        {appId && actionId && (
          <div className="px-4 pb-6">
            <Controller
              control={form.control}
              name="connectionId"
              render={({ fieldState }) => (
                <Field>
                  <FieldLabel>App connection</FieldLabel>
                  <FieldDescription className="pb-2">
                    Connect your account to use this action
                  </FieldDescription>
                  {!connectionId ? (
                    <ConnectBtn
                      appId={appId}
                      stepType={actionId}
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
          </div>
        )}

        {/* Configure */}
        {selectedAction && selectedAction.fields.length > 0 && connectionId && (
          <div className="mt-6 px-4">
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
              isLoading={isPending}
              connectionId={connectionId}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ActionSheet;
