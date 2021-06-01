import * as vsc from 'vscode';

export default function run(): void {
  void vsc.env.openExternal(vsc.Uri.parse(`https://www.statsig.com/lucky`));
}

export function register(): vsc.Disposable {
  return vsc.commands.registerCommand('statsig.feelingLucky', () => run());
}
