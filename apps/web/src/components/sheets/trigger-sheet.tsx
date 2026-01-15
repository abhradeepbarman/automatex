import apps from '@repo/common/@apps';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '../ui/button';
import { Form, FormField, FormItem, FormLabel } from '../ui/form';
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
  SheetTrigger,
} from '../ui/sheet';

const TriggerSheet = () => {
  const form = useForm();
  const appName = useWatch({
    control: form.control,
    name: 'appName',
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Add trigger</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add trigger</SheetTitle>
          <SheetDescription>
            Choose a trigger to add to your workflow
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <Form {...form}>
            {/* trigger app name  */}
            <FormField
              control={form.control}
              name="appName"
              render={() => (
                <FormItem>
                  <FormLabel>Choose app</FormLabel>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select app" />
                    </SelectTrigger>
                    <SelectContent>
                      {apps.map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </Form>
        </div>

        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TriggerSheet;
