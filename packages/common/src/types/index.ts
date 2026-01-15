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

export type FieldConfig = {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'number'
    | 'select'
    | 'textarea'
    | 'checkbox'
    | 'date';
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
  validations?: () => any;
  defaultValue?: any;
};

export interface IApp {
  id: string;
  name: string;
  description: string;
  icon?: string;
  triggers: ITrigger[];
  actions: IAction[];
}

export interface ITrigger {
  id: string;
  name: string;
  description: string;
  fields: FieldConfig[];
}

export interface IAction {
  id: string;
  name: string;
  description: string;
  fields: FieldConfig[];
}
