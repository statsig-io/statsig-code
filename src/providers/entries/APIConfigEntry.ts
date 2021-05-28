import * as vsc from 'vscode';
import { renderConfigInMarkdown } from '../../lib/configUtils';
import { StatsigConfig } from '../../state/ProjectsState';
import { Entry } from './Entry';

export abstract class APIConfigEntry extends Entry {
  constructor(public readonly data: StatsigConfig) {
    super(data.data.name, vsc.TreeItemCollapsibleState.None, data);
  }

  getChildren(): Thenable<never[]> {
    return Promise.resolve([]);
  }

  tooltip = renderConfigInMarkdown(this.data);
  contextValue = 'api_config';
}
