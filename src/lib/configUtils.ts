import * as vsc from 'vscode';
import { APIConfigRule } from '../contracts/projects';
import ProjectsState, { StatsigConfig } from '../state/ProjectsState';
import { getTierPrefix } from './webUtils';

export function getConfigUrl(c: StatsigConfig): vsc.Uri {
  return vsc.Uri.parse(
    `https://${getTierPrefix()}console.statsig.com/${c.projectID}/${
      c.type === 'feature_gate' ? 'gates' : 'dynamic_configs'
    }/${c.data.name}`,
  );
}

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

export interface StaleConfig {
  config: StatsigConfig;
  reason: string;
  gateReplacement: boolean | null;
  configReplacement: Record<string, unknown> | null;
}
export function getStaleConfigWithReason(
  configName: string,
): StaleConfig | null {
  const mainProject = ProjectsState.instance.getMainProject();
  const configs = ProjectsState.instance.findConfig(configName, mainProject);
  if (configs.length === 0) {
    return null;
  }
  const config = configs[0];
  if (config.data.checksInPast30Days === 0) {
    return {
      config,
      reason: '0 checks in the past 30 days',
      gateReplacement:
        config.type === 'feature_gate'
          ? (config.data.defaultValue as boolean)
          : null,
      configReplacement: {},
    };
  }
  if (!config.data.enabled) {
    return {
      config,
      reason: 'is disabled',
      gateReplacement:
        config.type === 'feature_gate'
          ? (config.data.defaultValue as boolean)
          : null,
      configReplacement: {},
    };
  }
  return null;
}

export type StaticConfigResult = 'pass' | 'fail' | 'mixed';
// A quick heuristic to show GK pass rate.  This is expected to work for simple
// GKs (eg disabled, or a single public group that always passes), and might
// return 'mixed' incorrectly for complex GKs.
export function getStaticResult(
  config: StatsigConfig,
): StaticConfigResult | undefined {
  if (config.type !== 'feature_gate') {
    return undefined;
  }

  const defaultResult = config.data.defaultValue ? 'pass' : 'fail';

  // Config uses the default value.
  if (!config.data.enabled || config.data.rules.length === 0) {
    return defaultResult;
  }

  // All rules match the default value.
  let alwaysDefault = true;
  for (const rule of config.data.rules) {
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
  for (const rule of config.data.rules) {
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

  for (const rule of config.data.rules) {
    if (!matchesResult(rule, publicResult)) {
      return 'mixed';
    }

    if (isPublic(rule)) {
      return publicResult;
    }
  }

  return publicResult;
}

export function renderConfigInMarkdown(
  c: StatsigConfig,
  includeProject?: boolean,
): vsc.MarkdownString {
  let body: string;
  if (c.type === 'feature_gate') {
    const staticResult = getStaticResult(c);
    let resultDescription = '_true/false_ (open console to see rules)';
    if (staticResult === 'pass') {
      resultDescription = '_true_';
    } else if (staticResult === 'fail') {
      resultDescription = '_false_';
    }

    body = `Value: ${resultDescription}`;
  } else {
    body = `Default value:\n\n\`\`\`json\n${JSON.stringify(
      c.data.defaultValue,
      undefined,
      2,
    )}\n\`\`\``;
  }

  if (c.data.checksInPast30Days !== undefined) {
    body = `${body} \n\n Checks in past 30 days: ${c.data.checksInPast30Days}`;
  }

  return new vsc.MarkdownString(
    `
#### Statsig ${c.type === 'feature_gate' ? 'gate' : 'config'} \`${c.data.name}\`
${includeProject ? `Project: __${c.projectName}__` : ''}

Status: _${c.data.enabled ? 'enabled' : 'disabled'}_

${body}

[Open in Console](${getConfigUrl(c).toString()})`,
    true,
  );
}
