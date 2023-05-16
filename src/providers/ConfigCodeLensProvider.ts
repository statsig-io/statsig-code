import * as vsc from 'vscode';
import * as fetchConfigs from '../commands/fetchConfigs';
import { getStaticResult } from '../lib/configUtils';
import { CONFIG_NAME_WITH_QUOTES_REGEX } from '../lib/languageUtils';
import ProjectsState, { StatsigConfig } from '../state/ProjectsState';

export class ConfigCodeLens extends vsc.CodeLens {
  constructor(
    public readonly config: StatsigConfig,
    range: vsc.Range,
    public readonly multipleProjects: boolean,
  ) {
    super(range);
  }
}

export default class ConfigCodeLensProvider implements vsc.CodeLensProvider {
  private _onDidChangeCodeLenses: vsc.EventEmitter<void> =
    new vsc.EventEmitter<void>();

  readonly onDidChangeCodeLenses: vsc.Event<void> =
    this._onDidChangeCodeLenses.event;

  refresh(): void {
    this._onDidChangeCodeLenses.fire();
  }

  resolveCodeLens(lens: ConfigCodeLens): vsc.ProviderResult<ConfigCodeLens> {
    return (() => {
      const updatedConfig = ProjectsState.instance
        .findConfig(lens.config.data.name)
        .find((c) => c.projectID === lens.config.projectID);

      if (!updatedConfig) {
        return undefined;
      }

      const staticResult = getStaticResult(updatedConfig);
      let resultDescription = undefined;
      if (staticResult === 'pass') {
        resultDescription = 'true';
      } else if (staticResult === 'fail') {
        resultDescription = 'false';
      } else if (staticResult === 'mixed') {
        resultDescription = 'true/false';
      }

      lens.command = {
        title: `Statsig ${
          updatedConfig.type === 'feature_gate' ? 'Gate' : 'Config'
        } "${updatedConfig.data.name}"${
          lens.multipleProjects ? ` (${updatedConfig.projectName})` : ''
        }${resultDescription ? `: ${resultDescription}` : ''}`,
        command: 'statsig.openConfigInConsole',
        arguments: [updatedConfig],
        tooltip: 'Open in Statsig Console',
      };

      return lens;
    })();
  }

  provideCodeLenses(
    document: vsc.TextDocument,
    token: vsc.CancellationToken,
  ): vsc.ProviderResult<ConfigCodeLens[]> {
    const lenses: ConfigCodeLens[] = [];
    for (let i = 0; i < document.lineCount; ++i) {
      if (token.isCancellationRequested) {
        break;
      }

      const line = document.lineAt(i);
      if (line.isEmptyOrWhitespace) {
        continue;
      }

      const text = line.text;
      const firstChar = text[line.firstNonWhitespaceCharacterIndex];
      if (
        text.length > 160 ||
        firstChar === '/' ||
        firstChar === '#' ||
        firstChar === '*'
      ) {
        // Likely not code.
        continue;
      }

      const configs = CONFIG_NAME_WITH_QUOTES_REGEX.exec(text);
      if (!configs) {
        continue;
      }

      for (const config of configs) {
        const configData = ProjectsState.instance.findConfig(
          config.substring(1, config.length - 1),
        );

        for (const c of configData) {
          lenses.push(new ConfigCodeLens(c, line.range, configData.length > 1));
        }
      }
    }

    return lenses;
  }
}
