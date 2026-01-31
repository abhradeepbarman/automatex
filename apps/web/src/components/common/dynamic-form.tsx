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
      schemaFields[field.name] = field.validations?.() ?? z.any();
    });

    return z.object(schemaFields);
  }, [fields]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: useMemo(() => {
      const values: Record<string, any> = {};
      fields?.forEach((f) => {
        values[f.name] = f.defaultValue;
      });
      return values;
    }, [fields]),
  });

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
              {...form.register(field.name)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            render={({ field: controllerField, fieldState }) => (
              <Field>
                <FieldLabel>{field.label}</FieldLabel>

                <Select
                  value={controllerField.value ?? ''}
                  onValueChange={controllerField.onChange}
                  disabled={field.disabled}
                >
                  <SelectTrigger>
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
            render={({ field: controllerField, fieldState }) => (
              <Field>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={controllerField.value as boolean}
                    onCheckedChange={(value) =>
                      controllerField.onChange(value === true)
                    }
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
