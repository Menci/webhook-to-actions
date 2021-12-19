import { workflowDispatch } from "./actions";
import { Trigger } from "./config";
import { createImmutableContext } from "./eval";

type DataObject = Record<string, unknown>;
const isObjectConditionSatisfied = (object: DataObject, condition: DataObject) => {
  for (const key in condition) {
    if (!(key in object)) return false;

    if (typeof condition[key] !== typeof object[key]) return false;

    if (typeof object[key] === "object" && object[key] && condition[key]) {
      if (!isObjectConditionSatisfied(object[key] as DataObject, condition[key] as DataObject)) return false;
    }

    if (object[key] !== condition[key]) return false;
  }

  return true;
};

const handleEval = (value: string, evalInContext: (expression: string) => unknown) => {
  const PREFIX = "${{";
  const SUFFIX = "}}";
  if (value.startsWith(PREFIX) && value.endsWith(SUFFIX)) {
    const expression = value.slice(PREFIX.length, -SUFFIX.length);
    return String(evalInContext(expression));
  }

  return value;
};

export async function handleWebhook(
  event: string,
  payload: Record<string, unknown>,
  query: Record<string, string>,
  trigger: Trigger
) {
  const context = createImmutableContext({ event, payload, query });
  const evalInContext = (expression: string) => context.eval(`(${expression})`);

  const triggerConditions = Array.isArray(trigger.if) ? trigger.if : [trigger.if];
  let conditionSatisfied = false;
  for (const condition of triggerConditions) {
    const currentConditionSatisfied =
      typeof condition === "string"
        ? !!evalInContext(condition)
        : (() => {
            if (condition.event) if (event !== condition.event) return false;

            if (condition.payload) if (!isObjectConditionSatisfied(payload, condition.payload)) return false;

            if (condition.query) if (!isObjectConditionSatisfied(query, condition.query)) return false;

            return true;
          })();

    if (currentConditionSatisfied) {
      conditionSatisfied = true;
      break;
    }
  }

  if (!conditionSatisfied)
    return {
      message: "No condition satisfied. Ignoring."
    };

  const ref = handleEval(trigger.ref, evalInContext);
  const inputs = { ...(trigger.inputs || {}) };
  for (const key in inputs) {
    inputs[key] = handleEval(inputs[key], evalInContext);
  }

  const tokenSecretName = trigger.token;
  if (!(tokenSecretName in self))
    return {
      error: `Token Secret ${JSON.stringify(tokenSecretName)} not found. Please add it to Worker secrets!`
    };
  const tokenSecret = self[tokenSecretName];

  // Parse workflow info
  const [username, repo, workflow] = (() => {
    const [usernameAndRepo, ...workflow] = trigger.workflow.split(":");
    const [username, ...repo] = usernameAndRepo.split("/");

    return [username, repo.join("/"), workflow.join(":")];
  })();

  return await workflowDispatch(tokenSecret, username, repo, workflow, ref, inputs);
}
