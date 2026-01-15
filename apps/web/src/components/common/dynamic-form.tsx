import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type FieldConfig } from '@repo/common/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';

interface DynamicFormProps {
  fields: FieldConfig[];
  onSubmit: (data: any) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

const DynamicForm = ({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  isLoading = false,
}: DynamicFormProps) => {
  const defaultValues = fields.reduce(
    (acc, field) => {
      acc[field.name] = field.defaultValue ?? '';
      return acc;
    },
    {} as Record<string, any>,
  );

  const schema = useMemo(() => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    fields.forEach((field) => {
      if (field.validations) {
        schemaFields[field.name] = field.validations();
      }
    });

    return z.object(schemaFields);
  }, [fields]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const renderField = (field: FieldConfig) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    {...formField}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'textarea':
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                    placeholder={field.placeholder}
                    {...formField}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'checkbox':
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{field.label}</FormLabel>
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field) => renderField(field))}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Submitting...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
};

export default DynamicForm;
