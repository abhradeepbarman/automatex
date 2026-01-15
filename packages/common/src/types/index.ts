export enum WorkflowStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum ConditionOperator {
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  CONTAINS = 'CONTAINS',
}

export enum StepType {
  TRIGGER = 'TRIGGER',
  ACTION = 'ACTION',
}

export type FieldType = 'text' | 'select' | 'number' | 'date';

export interface BaseField<TType extends FieldType = FieldType> {
  name: string;
  label: string;
  type: TType;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
}
export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export interface SelectField<TValue = string> extends BaseField<'select'> {
  selectOptions: SelectOption<TValue>[];
}

export interface IApp {
  id: string;
  name: string;
  description: string;
  icon?: string;
  triggers: ITrigger[];
}

export interface ITrigger {
  id: string;
  name: string;
  description: string;
  field: SelectField;
  operator: SelectField<ConditionOperator>;
  value: BaseField<'text'>;
}
