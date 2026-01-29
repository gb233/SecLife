import type { EngineState } from "./types";

export type ConditionNode = string | ConditionNode[];

const conditionCache = new Map<string, ConditionNode[]>();

export function parseCondition(condition: string): ConditionNode[] {
  const result: ConditionNode[] = [];
  const stack: ConditionNode[][] = [result];
  let cursor = 0;

  const pushToken = (index: number) => {
    const token = condition.substring(cursor, index).trim();
    cursor = index;
    if (token) {
      stack[0].push(token);
    }
  };

  for (let i = 0; i < condition.length; i += 1) {
    const ch = condition[i];
    if (ch === " ") continue;
    if (ch === "(") {
      pushToken(i);
      cursor += 1;
      const group: ConditionNode[] = [];
      stack[0].push(group);
      stack.unshift(group);
      continue;
    }
    if (ch === ")") {
      pushToken(i);
      cursor += 1;
      stack.shift();
      continue;
    }
    if (ch === "|" || ch === "&") {
      pushToken(i);
      pushToken(i + 1);
    }
  }

  pushToken(condition.length);
  return result;
}

export function checkCondition(state: EngineState, condition?: string): boolean {
  if (!condition) return true;
  const cached = conditionCache.get(condition);
  const parsed = cached ?? parseCondition(condition);
  if (!cached) {
    conditionCache.set(condition, parsed);
  }
  return checkParsed(state, parsed);
}

function checkParsed(state: EngineState, node: ConditionNode): boolean {
  if (!Array.isArray(node)) {
    return checkToken(state, node);
  }
  if (node.length === 0) return true;
  if (node.length === 1) return checkParsed(state, node[0]);

  let result = checkParsed(state, node[0]);
  for (let i = 1; i < node.length; i += 2) {
    const op = node[i];
    const next = node[i + 1];
    if (op === "&") {
      result = result && checkParsed(state, next);
    } else if (op === "|") {
      result = result || checkParsed(state, next);
    } else {
      return false;
    }
  }
  return result;
}

function checkToken(state: EngineState, token: string): boolean {
  const listMatch = token.match(/^([A-Za-z_]+)(\?|!)\[(.*)\]$/);
  if (listMatch) {
    const key = listMatch[1];
    const operator = listMatch[2];
    const values = listMatch[3]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return checkListCondition(state, key, values, operator);
  }

  const compareMatch = token.match(/^([A-Za-z_]+)\s*(>=|<=|!=|=|>|<)\s*(-?\d+(?:\.\d+)?)$/);
  if (compareMatch) {
    const [, key, op, rawValue] = compareMatch;
    const target = Number(rawValue);
    const current = getNumericValue(state, key);
    if (current === null) return false;
    switch (op) {
      case ">=":
        return current >= target;
      case "<=":
        return current <= target;
      case ">":
        return current > target;
      case "<":
        return current < target;
      case "=":
        return current === target;
      case "!=":
        return current !== target;
      default:
        return false;
    }
  }

  return false;
}

function getNumericValue(state: EngineState, key: string): number | null {
  if (key === "AGE") return state.age;
  if (key in state.stats) return state.stats[key];
  return null;
}

function checkListCondition(state: EngineState, key: string, values: string[], operator: string): boolean {
  const matches = (() => {
    if (key === "AGE") {
      return values.some((value) => Number(value) === state.age);
    }
    if (key === "FLAG") {
      return values.some((value) => state.flags.has(value));
    }
    if (key === "TAG") {
      return values.some((value) => state.tags.has(value));
    }
    if (key === "ACHV") {
      return values.some((value) => state.achievements.has(value));
    }
    if (key === "TLT") {
      return values.some((value) => state.talents.includes(value));
    }
    if (key === "EVT") {
      return values.some((value) => state.seenEvents.has(value));
    }
    return false;
  })();

  if (operator === "!") return !matches;
  return matches;
}
