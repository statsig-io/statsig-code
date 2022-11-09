import * as vsc from 'vscode';
import { renderConfigInMarkdown } from '../../lib/configUtils';
import { StatsigConfig } from '../../state/ProjectsState';
import { ConfigGroupEntry } from './ConfigGroupEntry';
import { Entry } from './Entry';

export abstract class APIConfigEntry extends Entry {
  constructor(
    public readonly data: StatsigConfig,
    readonly parent: ConfigGroupEntry,
  ) {
    super(data.data.name, vsc.TreeItemCollapsibleState.None, data, parent);
  }

  getParent(): Thenable<ConfigGroupEntry | null> {
    return Promise.resolve(this.parent);
  }

  getChildren(): Thenable<never[]> {
    return Promise.resolve([]);
  }

  tooltip = renderConfigInMarkdown(this.data);
  contextValue = 'statsig_config';
}
