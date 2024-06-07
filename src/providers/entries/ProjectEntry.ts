import * as vsc from 'vscode';

import { ConfigGroupEntry } from './ConfigGroupEntry';
import { DeveloperProject } from '../../contracts/projects';
import { Entry } from './Entry';
import { mp } from '../../icons/index';

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
    const sortedFeatureGates = this.data.feature_gates
      .filter((featureGate) =>
        mp.has(`${this.data.name},feature_gate,${featureGate.name}`),
      )
      .concat(
        this.data.feature_gates.filter(
          (featureGate) =>
            !mp.has(`${this.data.name},feature_gate,${featureGate.name}`),
        ),
      );
    const sortedDynamicConfigs = this.data.dynamic_configs
      .filter((dynamicConfig) =>
        mp.has(`${this.data.name},dynamic_config,${dynamicConfig.name}`),
      )
      .concat(
        this.data.dynamic_configs.filter(
          (dynamicConfig) =>
            !mp.has(`${this.data.name},dynamic_config,${dynamicConfig.name}`),
        ),
      );
    return Promise.resolve([
      new ConfigGroupEntry(
        'Feature Gates',
        vsc.TreeItemCollapsibleState.Collapsed,
        sortedFeatureGates.map((c) => {
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
        sortedDynamicConfigs.map((c) => {
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
