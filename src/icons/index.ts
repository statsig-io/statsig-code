import * as vsc from 'vscode';

import { StatsigConfig } from '../state/ProjectsState';

export enum ConfigType {
  pass,
  mixed,
  fail,
  enabled,
  disabled,
}

export const mp = new Map<string, boolean>();

export const getConfigThemeIcon = (
  configData: StatsigConfig,
  configType: ConfigType,
): vsc.ThemeIcon => {
  let themeIconType: string;
  const isFavourite: boolean =
    mp.get(
      `${configData.projectName},${configData.type},${configData.data.name}`,
    ) ?? false;

  if ([ConfigType.enabled, ConfigType.disabled].includes(configType)) {
    themeIconType = isFavourite ? 'star-empty' : 'circle-outline';
  } else {
    themeIconType = isFavourite ? 'star-full' : 'circle-filled';
  }

  let themeColourString: string;
  switch (configType) {
    case ConfigType.pass:
    case ConfigType.enabled:
      themeColourString = 'green';
      break;
    case ConfigType.fail:
    case ConfigType.disabled:
      themeColourString = 'red';
      break;
    default:
      themeColourString = 'yellow';
  }

  return new vsc.ThemeIcon(
    themeIconType,
    new vsc.ThemeColor(`charts.${themeColourString}`),
  );
};
