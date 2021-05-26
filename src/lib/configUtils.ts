import { APIConfigEntity, APIConfigRule } from '../contracts/projects';

function matchesResult(rule: APIConfigRule, result: 'pass' | 'fail'): boolean {
  if (result === 'pass') {
    return rule.passPercentage === 100;
  }

  return rule.passPercentage === 0;
}

function isPublic(rule: APIConfigRule): boolean {
  if (rule.conditions.length !== 1) {
    return false;
  }

  return rule.conditions[0].type === 'public';
}

export type StaticConfigResult = 'pass' | 'fail' | 'mixed';
// A quick heuristic to show GK pass rate.  This is expected to work for simple
// GKs (eg disabled, or a single public group that always passes), and might
// return 'mixed' incorrectly for complex GKs.
export function getStaticResult(
  config: APIConfigEntity,
): StaticConfigResult | undefined {
  if (config.type !== 'feature_gate') {
    return undefined;
  }

  const defaultResult = config.defaultValue ? 'pass' : 'fail';

  // Config uses the default value.
  if (!config.enabled || config.rules.length === 0) {
    return defaultResult;
  }

  // All rules match the default value.
  let alwaysDefault = true;
  for (const rule of config.rules) {
    if (!matchesResult(rule, defaultResult)) {
      alwaysDefault = false;
      break;
    }
  }

  if (alwaysDefault) {
    return defaultResult;
  }

  // All rules match the public value.
  let publicResult: StaticConfigResult = 'mixed';
  for (const rule of config.rules) {
    if (!isPublic(rule)) {
      continue;
    }

    if (rule.passPercentage === 100) {
      publicResult = 'pass';
    } else if (rule.passPercentage === 0) {
      publicResult = 'fail';
    }

    break;
  }

  if (publicResult === 'mixed') {
    return 'mixed';
  }

  for (const rule of config.rules) {
    if (!matchesResult(rule, publicResult)) {
      return 'mixed';
    }

    if (isPublic(rule)) {
      return publicResult;
    }
  }

  return publicResult;
}
