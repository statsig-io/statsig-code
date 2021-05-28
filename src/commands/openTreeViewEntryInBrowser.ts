import * as vsc from 'vscode';
import { APIConfigEntry } from '../providers/entries/APIConfigEntry';
import { StatsigConfig } from '../state/ProjectsState';

export default function run(e: StatsigConfig): void {
  const type = e.data.type === 'feature_gate' ? 'gates' : 'dynamic_configs';
  void vsc.env.openExternal(
    vsc.Uri.parse(
      `https://console.statsig.com/${e.projectID}/${type}/${e.data.name}`,
    ),
  );
}

export function register(_context: vsc.ExtensionContext): vsc.Disposable {
  return vsc.commands.registerCommand(
    'statsig.openTreeViewEntryInBrowser',
    (e: APIConfigEntry) => {
      run(e.data);
    },
  );
}
