import * as vsc from 'vscode';

type StatsigExtensionConfiguration = {
  refresh: {
    inBackground: boolean;
    interval: number;
  };
  textEditor: {
    enableHoverTooltips: boolean;
    enableCodeLens: boolean;
  };
  web: {
    tier: 'prod' | 'latest' | 'us-east-2' | 'us-west-2' | 'ap-south-1';
  };
};

export default function getExtensionConfig(): StatsigExtensionConfiguration {
  return vsc.workspace.getConfiguration('statsig') as Record<
    string,
    unknown
  > as StatsigExtensionConfiguration;
}
