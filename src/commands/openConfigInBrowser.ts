import * as vsc from 'vscode';
import { APIConfigEntry } from '../providers/entries/APIConfigEntry';

export default function run(e: APIConfigEntry): void {
  const type = e.data.type === 'feature_gate' ? 'gates' : 'dynamic_configs';
  void vsc.env.openExternal(
    vsc.Uri.parse(
      `https://console.statsig.com/${e.projectID}/${type}/${e.data.name}`,
    ),
  );
}

export function register(_context: vsc.ExtensionContext): vsc.Disposable {
  return vsc.commands.registerCommand(
    'statsig.openConfigInBrowser',
    (e: APIConfigEntry) => {
      run(e);
    },
  );
}
