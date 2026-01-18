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

export enum AppType {
  GMAIL = 'GMAIL',
  SLACK = 'SLACK',
}

export interface IApp {
  id: AppType;
  name: string;
  description: string;
  icon?: string;
  auth: IAuth;
  triggers: ITrigger[];
  actions: IAction[];
}

export interface ITrigger {
  id: string;
  name: string;
  description: string;
  scopes: string[];
  fields: FieldConfig[];
}

export interface IAction {
  id: string;
  name: string;
  description: string;
  scopes: string[];
  fields: FieldConfig[];
}

export interface IAuth {
  redirectUrl: string;
  tokenUrl: string;
}
