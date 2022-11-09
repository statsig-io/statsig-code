import { CONFIG_ENABLED_ICON, CONFIG_DISABLED_ICON } from '../../icons';
import { StatsigConfig } from '../../state/ProjectsState';
import { APIConfigEntry } from './APIConfigEntry';
import { ConfigGroupEntry } from './ConfigGroupEntry';

export class ConfigEntry extends APIConfigEntry {
  constructor(
    public readonly data: StatsigConfig,
    readonly parent: ConfigGroupEntry,
  ) {
    super(data, parent);
  }

  iconPath = this.data.data.enabled
    ? CONFIG_ENABLED_ICON
    : CONFIG_DISABLED_ICON;
}
