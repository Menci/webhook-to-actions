export interface Config {
  triggers: Trigger[];
}

export interface Trigger {
  id: string;
  webhookSecret: string;
  if: TriggerCondition | TriggerCondition[];
  token: string;
  workflow: string;
  ref: string;
  inputs?: Record<string, string>;
}

export type TriggerCondition = TriggerConditionObject | string;

export interface TriggerConditionObject {
  event?: string;
  payload?: Record<string, unknown>;
  query?: Record<string, string>;
}
