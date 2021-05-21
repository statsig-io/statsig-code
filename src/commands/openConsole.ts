import * as vsc from 'vscode';

export default function run(): void {
  void vsc.env.openExternal(vsc.Uri.parse('https://console.statsig.com'));
}

export function register(_context: vsc.ExtensionContext): vsc.Disposable {
  return vsc.commands.registerCommand('statsig.openConsole', () => {
    run();
  });
}
