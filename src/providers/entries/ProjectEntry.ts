import * as vsc from 'vscode';
import { DeveloperProject } from '../../contracts/projects';
import { Entry } from './Entry';
import { ConfigGroupEntry } from './ConfigGroupEntry';

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
        vsc.TreeItemCollapsibleState.Expanded,
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
        vsc.TreeItemCollapsibleState.Expanded,
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
