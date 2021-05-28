import * as vsc from 'vscode';
import { Entry } from './Entry';
import { ConfigEntry } from './ConfigEntry';
import { GateEntry } from './GateEntry';
import { StatsigConfig } from '../../state/ProjectsState';

const configIcon = new vsc.ThemeIcon('server-process');
const gateIcon = new vsc.ThemeIcon('settings');

export class ConfigGroupEntry extends Entry {
  constructor(
    public readonly label: 'Feature Gates' | 'Dynamic Configs',
    readonly collapsibleState: vsc.TreeItemCollapsibleState,
    public readonly data: StatsigConfig[],
  ) {
    super(label, collapsibleState, data);
  }

  getChildren(): Thenable<Entry[]> {
    return Promise.resolve(
      this.data.map((c) =>
        this.label === 'Feature Gates' ? new GateEntry(c) : new ConfigEntry(c),
      ),
    );
  }

  iconPath = this.label === 'Feature Gates' ? gateIcon : configIcon;
}
