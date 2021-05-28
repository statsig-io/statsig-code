import * as vsc from 'vscode';
import { getTierPrefix } from '../lib/webUtils';

export default function run(): void {
  void vsc.env.openExternal(
    vsc.Uri.parse(`https://${getTierPrefix('console')}.statsig.com`),
  );
}

export function register(_context: vsc.ExtensionContext): vsc.Disposable {
  return vsc.commands.registerCommand('statsig.openConsole', () => {
    run();
  });
}
