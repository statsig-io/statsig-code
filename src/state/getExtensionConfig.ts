import * as vsc from 'vscode';

type StatsigExtensionConfiguration = {
  refresh: {
    inBackground: boolean;
    interval: number;
  };
  textEditor: {
    enableHoverTooltips: boolean;
    enableCodeLens: boolean;
    enableDiagnostics: boolean;
  };
  web: {
    tier: 'prod' | 'latest';
  };
};

export default function getExtensionConfig(): StatsigExtensionConfiguration {
  return vsc.workspace.getConfiguration('statsig') as Record<
    string,
    unknown
  > as StatsigExtensionConfiguration;
}
