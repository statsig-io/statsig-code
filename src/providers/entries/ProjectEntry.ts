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
        vsc.TreeItemCollapsibleState.Expanded,
        this.data.feature_gates.map((c) => {
          return {
            projectID: this.data.id,
            projectName: this.data.name,
            type: 'feature_gate',
            data: c,
          };
        }),
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
      ),
    ]);
  }
}
