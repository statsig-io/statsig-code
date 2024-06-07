import * as copyToClipboard from './commands/copyToClipboard';
import * as feelingLucky from './commands/feelingLucky';
import * as fetchConfigs from './commands/fetchConfigs';
import * as openConfigInConsole from './commands/openConfigInConsole';
import * as openConsole from './commands/openConsole';
import * as openTreeViewEntryInBrowser from './commands/openTreeViewEntryInBrowser';
import * as selectMainProject from './commands/selectMainProject';
import * as signIn from './commands/signIn';
import * as signOut from './commands/signOut';
import * as toggleFavourite from './commands/toggleFavourite';
import * as vsc from 'vscode';

import {
  ConfigCodeActionProvider,
  registerCommands,
} from './providers/ConfigCodeActionProvider';

import AuthState from './state/AuthState';
import ConfigCodeLensProvider from './providers/ConfigCodeLensProvider';
import ConfigHoverProvider from './providers/ConfigHoverProvider';
import ProjectsProvider from './providers/ProjectsProvider';
import ProjectsState from './state/ProjectsState';
import UriHandler from './UriHandler';
import getExtensionConfig from './state/getExtensionConfig';
import { subscribeToDocumentChanges } from './providers/diagnostics';

export function activate(context: vsc.ExtensionContext): void {
  const globalState: vsc.Memento = context.globalState;

  const getData = (key: string): boolean => {
    return key ? globalState.get(key) ?? false : false;
  };

  const getCommandDisposable = vsc.commands.registerCommand(
    'statsig.getData',
    getData,
  );

  const toggleCommandDisposable = vsc.commands.registerCommand(
    'statsig.toggleData',
    async (key: string): Promise<void> => {
      await globalState.update(key, !getData(key));
    },
  );

  const config = getExtensionConfig();
  const projectsProvider = new ProjectsProvider();
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

  const refreshViews = (): void => {
    projectsProvider.refresh();
    codeLensProvider?.refresh();
  };

  const refreshViewsDisposable = vsc.commands.registerCommand(
    'statsig.refreshViews',
    async (): Promise<void> => {
      refreshViews();
      return Promise.resolve();
    },
  );

  AuthState.init(context, refreshViews);
  ProjectsState.init(context, refreshViews);

  const staleConfigDiagnostic = vsc.languages.createDiagnosticCollection(
    'statsig.stale-config',
  );

  context.subscriptions.push(
    openTreeViewEntryInBrowser.register(),
    toggleFavourite.register(),
    openConfigInConsole.register(),
    openConsole.register(),
    signIn.register(),
    signOut.register(),
    fetchConfigs.register(),
    copyToClipboard.register(),
    selectMainProject.register(),
    feelingLucky.register(),
    vsc.window.registerUriHandler(new UriHandler()),
    vsc.window.registerTreeDataProvider('statsig.projects', projectsProvider),
    statsigProjectsView,
    staleConfigDiagnostic,
    getCommandDisposable,
    toggleCommandDisposable,
    refreshViewsDisposable,
  );

  if (config.textEditor.enableDiagnostics) {
    const staleConfigDiagnostic = vsc.languages.createDiagnosticCollection(
      'statsig.stale-config',
    );
    context.subscriptions.push(staleConfigDiagnostic);
    subscribeToDocumentChanges(context, staleConfigDiagnostic, [
      projectsProvider.getOnDidChangeTreeData(),
    ]);
  }

  if (config.textEditor.enableHoverTooltips) {
    vsc.languages.registerHoverProvider(
      { scheme: 'file' },
      new ConfigHoverProvider(),
    );
  }

  vsc.languages.registerCodeActionsProvider(
    { scheme: 'file' },
    new ConfigCodeActionProvider(),
    {
      providedCodeActionKinds: ConfigCodeActionProvider.providedCodeActionKinds,
    },
  );
  registerCommands(context);

  void fetchConfigs.run({
    throttle: true,
    silent: true,
    incremental: true,
  });

  if (config.refresh.inBackground) {
    setInterval(function () {
      void fetchConfigs.run({ silent: true, incremental: true });
    }, Math.max(1, config.refresh.interval) * 60 * 1000).unref();
  }
}

export function deactivate(): void {
  //
}
