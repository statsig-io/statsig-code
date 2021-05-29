import * as vsc from 'vscode';

export default function run(): void {
  void vsc.env.openExternal(
    vsc.Uri.parse(`https://www.youtube.com/watch?v=dQw4w9WgXcQ`),
  );
}

export function register(): vsc.Disposable {
  return vsc.commands.registerCommand('statsig.feelingLucky', () => run());
}
