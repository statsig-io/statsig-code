import * as vsc from 'vscode';
import { StatsigViewContainer } from './StatsigViewContainer';

export function activate(context: vsc.ExtensionContext) {
  let disposable = vsc.commands.registerCommand('statsig.openConsole', () => {
    vsc.env.openExternal(vsc.Uri.parse('https://console.statsig.com'));
  });

  context.subscriptions.push(disposable);

  new StatsigViewContainer(context);
}

export function deactivate() {}
