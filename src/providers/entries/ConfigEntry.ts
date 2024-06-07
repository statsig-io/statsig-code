import { ConfigType, getConfigThemeIcon } from '../../icons';

import { APIConfigEntry } from './APIConfigEntry';
import { ConfigGroupEntry } from './ConfigGroupEntry';
import { StatsigConfig } from '../../state/ProjectsState';

export class ConfigEntry extends APIConfigEntry {
  constructor(
    public readonly data: StatsigConfig,
    readonly parent: ConfigGroupEntry,
  ) {
    super(data, parent);
  }

  iconPath = getConfigThemeIcon(
    this.data,
    this.data.data.enabled ? ConfigType.enabled : ConfigType.disabled,
  );
}
