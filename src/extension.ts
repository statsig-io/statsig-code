import * as vsc from 'vscode';

export function activate(context: vsc.ExtensionContext) {
  let disposable = vsc.commands.registerCommand('statsig.openConsole', () => {
    vsc.env.openExternal(vsc.Uri.parse('https://console.statsig.com'));
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
