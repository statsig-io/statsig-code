import * as vsc from 'vscode';

interface Entry {
  uri: vsc.Uri;
  type: vsc.FileType;
}

class ProjectsProvider implements vsc.TreeDataProvider<Entry> {
  getTreeItem(_element: Entry): vsc.TreeItem | Thenable<vsc.TreeItem> {
    return new vsc.TreeItem('TreeItem');
  }

  getChildren(_element?: Entry): vsc.ProviderResult<Entry[]> {
    return [];
  }
}

export class StatsigViewContainer {
  constructor(context: vsc.ExtensionContext) {
    const projectsProvider = new ProjectsProvider();
    context.subscriptions.push(
      vsc.window.createTreeView('projects', {
        treeDataProvider: projectsProvider,
      }),
    );
  }
}
