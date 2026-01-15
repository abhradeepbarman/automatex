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

interface ITriggerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setNodes: Dispatch<SetStateAction<Node[]>>;
}

const TriggerSheet = ({ open, onOpenChange, setNodes }: ITriggerSheetProps) => {
  const form = useForm({
    defaultValues: {
      appId: '',
      triggerId: '',
    },
  });
  const [appId, triggerId] = useWatch({
    control: form.control,
    name: ['appId', 'triggerId'],
  });

  const selectedTrigger = useMemo(() => {
    if (!appId || !triggerId) return null;
    const app = apps.find((app) => app.id === appId);
    return app?.triggers.find((trigger) => trigger.id === triggerId);
  }, [appId, triggerId]);

  const onSubmit = (fieldData: any) => {
    const triggerData = {
      appId,
      triggerId,
      fields: fieldData,
    };

    setNodes((prev) => [
      ...prev,
      {
        id: `trigger-${Date.now()}`,
        type: 'triggerNode',
        position: { x: 100, y: 100 },
        data: {
          ...triggerData,
        },
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
                        {...form.register('triggerId', {
                          required: {
                            value: true,
                            message: 'Please select a trigger',
                          },
                        })}
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
            </form>
          </Form>

          {/* Connection */}
          {selectedTrigger && (
            <div className="mt-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium">App connection</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your account to use this trigger
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
