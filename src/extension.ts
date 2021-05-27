import * as vsc from 'vscode';
import * as openConsole from './commands/openConsole';
import * as signIn from './commands/signIn';
import * as signOut from './commands/signOut';
import * as fetchConfigs from './commands/fetchConfigs';
import * as openConfigInConsole from './commands/openConfigInConsole';
import * as openTreeViewEntryInBrowser from './commands/openTreeViewEntryInBrowser';
import UriHandler from './UriHandler';
import ProjectsProvider from './providers/projects';

export function activate(context: vsc.ExtensionContext): void {
  const projectsProvider = new ProjectsProvider(context);
  const statsigProjectsView = vsc.window.createTreeView('statsig.projects', {
    treeDataProvider: projectsProvider,
  });

  context.subscriptions.push(
    openTreeViewEntryInBrowser.register(context),
    openConfigInConsole.register(context),
    openConsole.register(context),
    signIn.register(context),
    signOut.register(context, projectsProvider),
    fetchConfigs.register(context, projectsProvider),
    vsc.window.registerUriHandler(new UriHandler()),
    vsc.window.registerTreeDataProvider('statsig.projects', projectsProvider),
    statsigProjectsView,
  );

  // One day I'll make this interval customizable--or maybe you should!
  // The default matches the autofetch period of the Git extension.
  setInterval(function () {
    void fetchConfigs.run({ silent: true });
  }, 3 * 60 * 1000).unref();
}

export function deactivate(): void {
  //
}
