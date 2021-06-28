import * as vsc from 'vscode';
import { getTierPrefix } from '../lib/webUtils';
import { APIConfigEntry } from '../providers/entries/APIConfigEntry';
import { StatsigConfig } from '../state/ProjectsState';

export default function run(e: StatsigConfig): void {
  const type = e.data.type === 'feature_gate' ? 'gates' : 'dynamic_configs';
  void vsc.env.openExternal(
    vsc.Uri.parse(
      `https://${getTierPrefix()}console.statsig.com/${e.projectID}/${type}/${
        e.data.name
      }`,
    ),
  );
}

export function register(): vsc.Disposable {
  return vsc.commands.registerCommand(
    'statsig.openTreeViewEntryInBrowser',
    (e: APIConfigEntry) => run(e.data),
  );
}
