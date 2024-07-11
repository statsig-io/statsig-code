import * as vsc from 'vscode';

import { ConfigGroupEntry } from './ConfigGroupEntry';
import { DeveloperProject } from '../../contracts/projects';
import { Entry } from './Entry';

export class ProjectEntry extends Entry {
  constructor(
    public readonly label: string | vsc.TreeItemLabel,
    readonly collapsibleState: vsc.TreeItemCollapsibleState,
    public readonly data: DeveloperProject,
  ) {
    super(label, collapsibleState, data);
  }

  getParent(): Thenable<Entry | null> {
    return Promise.resolve(null);
  }

  getChildren(): Thenable<Entry[]> {
    return Promise.resolve([
      new ConfigGroupEntry(
        'Feature Gates',
        vsc.TreeItemCollapsibleState.Collapsed,
        this.data.feature_gates.map((c) => {
          return {
            projectID: this.data.id,
            projectName: this.data.name,
            type: 'feature_gate',
            data: c,
          };
        }),
        this,
      ),
      new ConfigGroupEntry(
        'Dynamic Configs',
        vsc.TreeItemCollapsibleState.Collapsed,
        this.data.dynamic_configs.map((c) => {
          return {
            projectID: this.data.id,
            projectName: this.data.name,
            type: 'dynamic_config',
            data: c,
          };
        }),
        this,
      ),
    ]);
  }

  contextValue = 'project_entry';
}
