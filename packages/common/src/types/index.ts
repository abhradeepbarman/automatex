export enum ConditionOperator {
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  CONTAINS = 'CONTAINS',
}

export enum StepType {
  TRIGGER = 'TRIGGER',
  ACTION = 'ACTION',
}

export enum ExecutionResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
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
  disabled?: boolean;
  required?: boolean;
  options?: { label: string; value: any }[];
  dynamicOptions?: {
    url: string;
    labelKey: string;
    valueKey: string;
    dataPath?: string;
  };
  validations?: () => any;
  defaultValue?: any;
};

export enum AppType {
  SYSTEM = 'system',
  GMAIL = 'gmail',
  NOTION = 'notion',
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface IApp {
  id: AppType;
  name: string;
  description: string;
  icon?: string;
  triggers?: ITrigger[];
  actions?: IAction[];
  auth?: {
    getAuthUrl: () => string;
    getToken: (code: string) => Promise<TokenResponse>;
    getUserInfo: (accessToken: string) => Promise<any>;
  };
}

export interface ITrigger {
  id: string;
  name: string;
  description: string;
  fields?: FieldConfig[];
}

export interface IAction {
  id: string;
  name: string;
  description: string;
  fields?: FieldConfig[];
}
