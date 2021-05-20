import * as vsc from 'vscode';
import { StatsigViewContainer } from './StatsigViewContainer';

export function activate(context: vsc.ExtensionContext): void {
  context.subscriptions.push(
    vsc.commands.registerCommand('statsig.openConsole', () => {
      void vsc.env.openExternal(vsc.Uri.parse('https://console.statsig.com'));
    }),
    vsc.commands.registerCommand('statsig.openConsole', () => {
      void vsc.env.openExternal(vsc.Uri.parse('https://console.statsig.com'));
    }),
  );

  new StatsigViewContainer(context);
}

export function deactivate(): void {
  //
}
