import * as vsc from 'vscode';

import { ErrorEntry } from './entries/ErrorEntry';
import { Entry } from './entries/Entry';
import { ProjectEntry } from './entries/ProjectEntry';
import { ProjectsContract } from '../contracts/projects';

export default class ProjectsProvider implements vsc.TreeDataProvider<Entry> {
  constructor(private ctx: vsc.ExtensionContext) {}

  getTreeItem(element: Entry): vsc.TreeItem | Thenable<vsc.TreeItem> {
    return element;
  }

  getChildren(element?: Entry): Thenable<Entry[]> {
    if (!element) {
      return this.getRootChildren();
    }

    return Promise.resolve(element.getChildren());
  }

  getRootChildren(): Thenable<Entry[]> {
    const contract: ProjectsContract | undefined =
      this.ctx.globalState.get('projects');

    if (contract === undefined) {
      // User has not signed in yet.  An empty view will display default welcome content.
      return Promise.resolve([]);
    }

    const projects = contract.projects;
    if (projects.length === 0) {
      // This is extremely unlikely to happen, so will just display an ugly error.
      return Promise.resolve([
        new ErrorEntry('You are not a member of any projects!'),
      ]);
    }

    return Promise.resolve(
      projects.map(
        (p) =>
          new ProjectEntry(p.name, vsc.TreeItemCollapsibleState.Collapsed, p),
      ),
    );
  }
}
