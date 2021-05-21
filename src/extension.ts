import * as vsc from 'vscode';
import * as openConsole from './commands/openConsole';
import * as signIn from './commands/signIn';
import { StatsigViewContainer } from './StatsigViewContainer';
import UriHandler from './UriHandler';

export function activate(context: vsc.ExtensionContext): void {
  context.subscriptions.push(
    openConsole.register(context),
    signIn.register(context),
    vsc.window.registerUriHandler(new UriHandler()),
  );

  new StatsigViewContainer(context);
}

export function deactivate(): void {
  //
}
