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
  GMAIL = 'gmail',
  NOTION = 'notion',
  GITHUB = 'github',
}

export interface IApp {
  id: AppType;
  name: string;
  description: string;
  icon?: string;
  triggers: ITrigger[];
  actions: IAction[];
  getAuthUrl: () => string;
  getTokenUrl: (code: string) => string;
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

export interface ITriggerMetadata {
  appId: string;
  triggerId: string;
  fields: ITriggerFields;
}

export interface ITriggerFields {
  field: string;
  operator: string;
  value: string;
}
