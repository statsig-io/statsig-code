import * as vsc from 'vscode';

export const CONFIG_PASS_ICON = new vsc.ThemeIcon(
  'circle-filled',
  new vsc.ThemeColor('charts.green'),
);

export const CONFIG_MIXED_ICON = new vsc.ThemeIcon(
  'circle-filled',
  new vsc.ThemeColor('charts.yellow'),
);

export const CONFIG_FAIL_ICON = new vsc.ThemeIcon(
  'circle-filled',
  new vsc.ThemeColor('charts.red'),
);

export const CONFIG_ENABLED_ICON = new vsc.ThemeIcon(
  'circle-outline',
  new vsc.ThemeColor('charts.green'),
);

export const CONFIG_DISABLED_ICON = new vsc.ThemeIcon(
  'circle-outline',
  new vsc.ThemeColor('charts.red'),
);
