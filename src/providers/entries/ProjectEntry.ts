import * as vsc from 'vscode';
import { DeveloperProject } from '../../contracts/projects';
import { Entry } from './Entry';
import { ConfigGroupEntry } from './ConfigGroupEntry';

export class ProjectEntry extends Entry {
  constructor(
    public readonly label: string,
    readonly collapsibleState: vsc.TreeItemCollapsibleState,
    public readonly data: DeveloperProject,
  ) {
    super(label, collapsibleState, data);
  }

  getChildren(): Thenable<Entry[]> {
    return Promise.resolve([
      new ConfigGroupEntry(
        'Feature Gates',
        vsc.TreeItemCollapsibleState.Collapsed,
        this.data.id,
        this.data.feature_gates,
      ),
      new ConfigGroupEntry(
        'Dynamic Configs',
        vsc.TreeItemCollapsibleState.Collapsed,
        this.data.id,
        this.data.dynamic_configs,
      ),
    ]);
  }
}
