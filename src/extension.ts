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
import getExtensionConfig from './state/getExtensionConfig';
import ConfigCodeLensProvider from './providers/ConfigCodeLensProvider';

export function activate(context: vsc.ExtensionContext): void {
  const config = getExtensionConfig();
  const projectsProvider = new ProjectsProvider(context);
  const statsigProjectsView = vsc.window.createTreeView('statsig.projects', {
    treeDataProvider: projectsProvider,
  });

  const codeLensProvider = config.textEditor.enableCodeLens
    ? new ConfigCodeLensProvider()
    : undefined;

  if (codeLensProvider) {
    vsc.languages.registerCodeLensProvider(
      { scheme: 'file' },
      codeLensProvider,
    );
  }

  const refreshViews = () => {
    projectsProvider.refresh();
    codeLensProvider?.refresh();
  };

  AuthState.init(context, refreshViews);
  ProjectsState.init(context, refreshViews);

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

  if (config.textEditor.enableHoverTooltips) {
    vsc.languages.registerHoverProvider(
      { scheme: 'file' },
      new ConfigHoverProvider(),
    );
  }

  void fetchConfigs.run({
    throttle: true,
    silent: true,
    incremental: true,
  });

  if (config.refresh.inBackground) {
    setInterval(function () {
      void fetchConfigs.run({ silent: true, incremental: true });
    }, Math.min(1, config.refresh.interval) * 60 * 1000).unref();
  }
}

export function deactivate(): void {
  //
}
