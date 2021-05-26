import * as vsc from 'vscode';
import * as openConsole from './commands/openConsole';
import * as signIn from './commands/signIn';
import * as openConfigInBrowser from './commands/openConfigInBrowser';
import UriHandler from './UriHandler';
import ProjectsProvider from './providers/projects';

export function activate(context: vsc.ExtensionContext): void {
  const projectsProvider = new ProjectsProvider(context);
  context.subscriptions.push(
    openConfigInBrowser.register(context),
    openConsole.register(context),
    signIn.register(context),
    vsc.window.registerUriHandler(new UriHandler()),
    vsc.window.registerTreeDataProvider('statsig.projects', projectsProvider),
    vsc.window.createTreeView('statsig.projects', {
      treeDataProvider: projectsProvider,
    }),
  );
}

export function deactivate(): void {
  //
}
