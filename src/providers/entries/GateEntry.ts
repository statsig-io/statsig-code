import { ConfigType, getConfigThemeIcon } from '../../icons';

import { APIConfigEntry } from './APIConfigEntry';
import { ConfigGroupEntry } from './ConfigGroupEntry';
import { StatsigConfig } from '../../state/ProjectsState';
import { getStaticResult } from '../../lib/configUtils';

export class GateEntry extends APIConfigEntry {
  constructor(
    public readonly data: StatsigConfig,
    readonly parent: ConfigGroupEntry,
  ) {
    super(data, parent);
    if (!data.data.enabled) {
      this.iconPath = getConfigThemeIcon(data, ConfigType.disabled);
    } else {
      switch (getStaticResult(this.data)) {
        case 'pass':
          this.iconPath = getConfigThemeIcon(data, ConfigType.pass);
          break;
        case 'fail':
          this.iconPath = getConfigThemeIcon(data, ConfigType.fail);
          break;
        case 'mixed':
          this.iconPath = getConfigThemeIcon(data, ConfigType.mixed);
          break;
      }
    }
  }
}
