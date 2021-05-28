import * as vsc from 'vscode';
import * as openConsole from './commands/openConsole';
import * as signIn from './commands/signIn';
import * as signOut from './commands/signOut';
import * as fetchConfigs from './commands/fetchConfigs';
import * as openConfigInConsole from './commands/openConfigInConsole';
import * as openTreeViewEntryInBrowser from './commands/openTreeViewEntryInBrowser';
import UriHandler from './UriHandler';
import ProjectsProvider from './providers/ProjectsProvider';
import AuthState from './state/AuthState';
import ProjectsState from './state/ProjectsState';
import ConfigHoverProvider from './providers/ConfigHoverProvider';

export function activate(context: vsc.ExtensionContext): void {
  const projectsProvider = new ProjectsProvider(context);
  const statsigProjectsView = vsc.window.createTreeView('statsig.projects', {
    treeDataProvider: projectsProvider,
  });

  const refreshProjectsView = () => projectsProvider.refresh();
  AuthState.init(context, refreshProjectsView);
  ProjectsState.init(context, refreshProjectsView);

  context.subscriptions.push(
    openTreeViewEntryInBrowser.register(context),
    openConfigInConsole.register(context),
    openConsole.register(context),
    signIn.register(),
    signOut.register(),
    fetchConfigs.register(),
    vsc.window.registerUriHandler(new UriHandler()),
    vsc.window.registerTreeDataProvider('statsig.projects', projectsProvider),
    statsigProjectsView,
  );

  vsc.languages.registerHoverProvider(
    { scheme: 'file' },
    new ConfigHoverProvider(),
  );

  void fetchConfigs.run({
    throttle: true,
    silent: true,
    incremental: true,
  });

  // One day I'll make this interval customizable--or maybe you should!
  // The default matches the autofetch period of the Git extension.
  setInterval(function () {
    void fetchConfigs.run({ silent: true, incremental: true });
  }, 3 * 60 * 1000).unref();
}

export function deactivate(): void {
  //
}
