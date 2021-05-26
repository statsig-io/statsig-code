import * as vsc from 'vscode';

import { APIConfigEntity } from '../../contracts/projects';
import { getStaticResult } from '../../lib/configUtils';
import { APIConfigEntry, configDisabledIcon } from './APIConfigEntry';

const configPassIcon = new vsc.ThemeIcon(
  'circle-filled',
  new vsc.ThemeColor('charts.green'),
);

const configMixedIcon = new vsc.ThemeIcon(
  'circle-filled',
  new vsc.ThemeColor('charts.yellow'),
);

const configFailIcon = new vsc.ThemeIcon(
  'circle-filled',
  new vsc.ThemeColor('charts.red'),
);

export class GateEntry extends APIConfigEntry {
  constructor(
    public readonly projectID: string,
    public readonly data: APIConfigEntity,
  ) {
    super(projectID, data);
    if (!data.enabled) {
      this.iconPath = configDisabledIcon;
    } else {
      switch (getStaticResult(this.data)) {
        case 'pass':
          this.iconPath = configPassIcon;
          break;
        case 'fail':
          this.iconPath = configFailIcon;
          break;
        case 'mixed':
          this.iconPath = configMixedIcon;
          break;
      }
    }
  }
}
