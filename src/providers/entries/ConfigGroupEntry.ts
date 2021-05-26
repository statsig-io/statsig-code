import * as vsc from 'vscode';
import { APIConfigEntity } from '../../contracts/projects';
import { Entry } from './Entry';
import { ConfigEntry } from './ConfigEntry';
import { GateEntry } from './GateEntry';

const configIcon = new vsc.ThemeIcon('server-process');
const gateIcon = new vsc.ThemeIcon('settings');

export class ConfigGroupEntry extends Entry {
  constructor(
    public readonly label: 'Feature Gates' | 'Dynamic Configs',
    readonly collapsibleState: vsc.TreeItemCollapsibleState,
    public readonly projectID: string,
    public readonly data: APIConfigEntity[],
  ) {
    super(label, collapsibleState, data);
  }

  getChildren(): Thenable<Entry[]> {
    return Promise.resolve(
      this.data.map((c) =>
        this.label === 'Feature Gates'
          ? new GateEntry(this.projectID, c)
          : new ConfigEntry(this.projectID, c),
      ),
    );
  }

  iconPath = this.label === 'Feature Gates' ? gateIcon : configIcon;
}
