/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

export type DeveloperProject = {
  id: string;
  name: string;
  dynamic_configs: Array<APIConfigEntity>;
  feature_gates: Array<APIConfigEntity>;
  time: number;
};

export type ProjectsContract = {
  projects: Array<DeveloperProject>;
};

export type APIConfigEntity = {
  name: string;
  type: string;
  salt: string;
  defaultValue: boolean | Record<string, any>;
  enabled: boolean;
  rules: Array<APIConfigRule>;
};

export type APIConfigRule = {
  name: string;
  passPercentage: number;
  conditions: Array<APIConfigCondition>;
  returnValue: Record<string, any>;
  id: string;
};

export type APIConfigCondition = {
  type: string;
  targetValue: string[] | number | null;
  operator: string | null;
  field: string | null;
};
