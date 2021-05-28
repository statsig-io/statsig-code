import { CONFIG_ENABLED_ICON, CONFIG_DISABLED_ICON } from '../../icons';
import { StatsigConfig } from '../../state/ProjectsState';
import { APIConfigEntry } from './APIConfigEntry';

export class ConfigEntry extends APIConfigEntry {
  constructor(public readonly data: StatsigConfig) {
    super(data);
  }

  iconPath = this.data.data.enabled
    ? CONFIG_ENABLED_ICON
    : CONFIG_DISABLED_ICON;
}
