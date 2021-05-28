import {
  CONFIG_DISABLED_ICON,
  CONFIG_FAIL_ICON,
  CONFIG_MIXED_ICON,
  CONFIG_PASS_ICON,
} from '../../icons';

import { getStaticResult } from '../../lib/configUtils';
import { StatsigConfig } from '../../state/ProjectsState';
import { APIConfigEntry } from './APIConfigEntry';

export class GateEntry extends APIConfigEntry {
  constructor(public readonly data: StatsigConfig) {
    super(data);
    if (!data.data.enabled) {
      this.iconPath = CONFIG_DISABLED_ICON;
    } else {
      switch (getStaticResult(this.data)) {
        case 'pass':
          this.iconPath = CONFIG_PASS_ICON;
          break;
        case 'fail':
          this.iconPath = CONFIG_FAIL_ICON;
          break;
        case 'mixed':
          this.iconPath = CONFIG_MIXED_ICON;
          break;
      }
    }
  }
}
