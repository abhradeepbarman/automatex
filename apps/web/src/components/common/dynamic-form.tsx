import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { type FieldConfig } from '@repo/common/types';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';

interface DynamicFormProps {
  fields: FieldConfig[];
  onSubmit: (data: any) => void;
  submitLabel: string;
}

const DynamicForm = ({ fields, onSubmit, submitLabel }: DynamicFormProps) => {
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
          <Controller
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField, fieldState }) => (
              <Field>
                <FieldLabel>{field.label}</FieldLabel>
                <Input
                  name={formField.name}
                  value={formField.value}
                  onChange={formField.onChange}
                  type={field.type}
                  placeholder={field.placeholder}
                />
                {field.description && (
                  <FieldDescription>{field.description}</FieldDescription>
                )}
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField, fieldState }) => (
              <Field>
                <FieldLabel>{field.label}</FieldLabel>
                <textarea
                  name={formField.name}
                  value={formField.value}
                  onChange={formField.onChange}
                  placeholder={field.placeholder}
                  className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                />
                {field.description && (
                  <FieldDescription>{field.description}</FieldDescription>
                )}
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        );

      case 'select':
        return (
          <Controller
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField, fieldState }) => (
              <Field>
                <FieldLabel>{field.label}</FieldLabel>
                <Select
                  name={formField.name}
                  value={formField.value}
                  onValueChange={formField.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description && (
                  <FieldDescription>{field.description}</FieldDescription>
                )}
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField, fieldState }) => (
              <Field>
                <div className="flex items-start space-x-3 rounded-md border p-4">
                  <Checkbox
                    name={formField.name}
                    value={formField.value}
                    onChange={formField.onChange}
                  />
                  <div className="space-y-1">
                    <FieldLabel>{field.label}</FieldLabel>
                    {field.description && (
                      <FieldDescription>{field.description}</FieldDescription>
                    )}
                  </div>
                </div>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => renderField(field))}
      <Button className="mt-6 w-full" type="submit">
        {submitLabel}
      </Button>
    </form>
  );
};

export default DynamicForm;
