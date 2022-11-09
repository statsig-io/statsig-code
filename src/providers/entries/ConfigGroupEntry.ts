import * as vsc from 'vscode';
import { Entry } from './Entry';
import { ConfigEntry } from './ConfigEntry';
import { GateEntry } from './GateEntry';
import { StatsigConfig } from '../../state/ProjectsState';
import { ProjectEntry } from './ProjectEntry';

const configIcon = new vsc.ThemeIcon('server-process');
const gateIcon = new vsc.ThemeIcon('settings');

export class ConfigGroupEntry extends Entry {
  constructor(
    public readonly label: 'Feature Gates' | 'Dynamic Configs',
    readonly collapsibleState: vsc.TreeItemCollapsibleState,
    public readonly data: StatsigConfig[],
    readonly parent: ProjectEntry,
  ) {
    super(label, collapsibleState, data);
  }

  getParent(): Thenable<ProjectEntry | null> {
    return Promise.resolve(this.parent);
  }

  getChildren(): Thenable<Entry[]> {
    return Promise.resolve(
      this.data.map((c) =>
        this.label === 'Feature Gates'
          ? new GateEntry(c, this)
          : new ConfigEntry(c, this),
      ),
    );
  }

  iconPath = this.label === 'Feature Gates' ? gateIcon : configIcon;
}
