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
import { LoaderCircle } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Field, FieldError, FieldLabel } from '../ui/field';

interface DynamicFormProps {
  fields: FieldConfig[] | undefined;
  onSubmit: (data: any) => void;
  submitLabel: string;
  isLoading: boolean;
  connectionId?: string;
}

const DynamicForm = ({
  fields,
  onSubmit,
  submitLabel,
  isLoading,
}: DynamicFormProps) => {
  const schema = useMemo(() => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    fields?.forEach((field) => {
      if (field.validations) {
        schemaFields[field.name] = field.validations();
      }
    });

    return z.object(schemaFields);
  }, [fields]);

  const form = useForm({ resolver: zodResolver(schema) });

  const renderField = (field: FieldConfig) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <Field key={field.name}>
            <FieldLabel>{field.label}</FieldLabel>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              disabled={field.disabled}
              defaultValue={field.defaultValue}
              {...form.register(field.name)}
            />
            {form.formState.errors[field.name] && (
              <FieldError errors={[form.formState.errors[field.name] as any]} />
            )}
          </Field>
        );

      case 'textarea':
        return (
          <Field key={field.name}>
            <FieldLabel>{field.label}</FieldLabel>
            <textarea
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={field.placeholder}
              disabled={field.disabled}
              defaultValue={field.defaultValue}
              {...form.register(field.name)}
            />
            {form.formState.errors[field.name] && (
              <FieldError errors={[form.formState.errors[field.name] as any]} />
            )}
          </Field>
        );

      case 'select':
        return (
          <Controller
            key={field.name}
            control={form.control}
            name={field.name}
            defaultValue={field.defaultValue || ''}
            render={({ field: controllerField, fieldState }) => (
              <Field>
                <FieldLabel>{field.label}</FieldLabel>
                <Select
                  value={
                    controllerField.value && controllerField.value !== ''
                      ? String(controllerField.value)
                      : undefined
                  }
                  onValueChange={(value) => {
                    const selectedOption = field.options?.find(
                      (opt) => String(opt.value) === value,
                    );
                    controllerField.onChange(
                      selectedOption ? selectedOption.value : value,
                    );
                  }}
                  disabled={field.disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem
                        key={String(option.value)}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            defaultValue={field.defaultValue || false}
            render={({ field: controllerField, fieldState }) => (
              <Field>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={controllerField.value as boolean}
                    onCheckedChange={controllerField.onChange}
                    disabled={field.disabled}
                  />
                  <FieldLabel className="mt-0">{field.label}</FieldLabel>
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {fields?.map((field) => renderField(field))}
      <Button className="mt-8 w-full" type="submit" disabled={isLoading}>
        {!isLoading ? submitLabel : <LoaderCircle className="animate-spin" />}
      </Button>
    </form>
  );
};

export default DynamicForm;
