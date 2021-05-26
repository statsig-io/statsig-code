import * as vsc from 'vscode';
import { APIConfigEntity } from '../../contracts/projects';
import { APIConfigEntry, configDisabledIcon } from './APIConfigEntry';

const configEnabledIcon = new vsc.ThemeIcon(
  'circle-outline',
  new vsc.ThemeColor('charts.green'),
);

export class ConfigEntry extends APIConfigEntry {
  constructor(
    public readonly projectID: string,
    public readonly data: APIConfigEntity,
  ) {
    super(projectID, data);
  }

  iconPath = this.data.enabled ? configEnabledIcon : configDisabledIcon;
}
