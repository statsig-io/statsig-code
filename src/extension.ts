import * as vsc from 'vscode';
import * as openConsole from './commands/openConsole';
import * as signIn from './commands/signIn';
import * as signOut from './commands/signOut';
import * as copyToClipboard from './commands/copyToClipboard';
import * as selectMainProject from './commands/selectMainProject';
import * as feelingLucky from './commands/feelingLucky';
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
import { subscribeToDocumentChanges } from './providers/diagnostics';
import {
  registerCommands,
  ConfigCodeActionProvider,
} from './providers/ConfigCodeActionProvider';
import { Entry } from './providers/entries/Entry';

export function activate(context: vsc.ExtensionContext): void {
  const config = getExtensionConfig();
  const projectsProvider = new ProjectsProvider(context);
  const statsigProjectsView = vsc.window.createTreeView('statsig.projects', {
    treeDataProvider: projectsProvider,
  });
  const setTreeViewFocus = async (entry: Entry) => {
    // await statsigProjectsView.reveal(entry, {
    //   select: true,
    //   focus: true,
    //   expand: true,
    // });
    await vsc.commands.executeCommand('setContext', 'statsig.mainProject', [
      `Kenny's Test Project`,
    ]);
    projectsProvider.refresh();
  };

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

  const staleConfigDiagnostic = vsc.languages.createDiagnosticCollection(
    'statsig.stale-config',
  );

  context.subscriptions.push(
    openTreeViewEntryInBrowser.register(),
    openConfigInConsole.register(),
    openConsole.register(),
    signIn.register(),
    signOut.register(),
    fetchConfigs.register(),
    copyToClipboard.register(),
    selectMainProject.register(setTreeViewFocus),
    feelingLucky.register(),
    vsc.window.registerUriHandler(new UriHandler()),
    vsc.window.registerTreeDataProvider('statsig.projects', projectsProvider),
    statsigProjectsView,
    staleConfigDiagnostic,
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
