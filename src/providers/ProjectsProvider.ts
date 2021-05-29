import * as vsc from 'vscode';

import { ErrorEntry } from './entries/ErrorEntry';
import { Entry } from './entries/Entry';
import { ProjectEntry } from './entries/ProjectEntry';
import ProjectsState from '../state/ProjectsState';

export default class ProjectsProvider implements vsc.TreeDataProvider<Entry> {
  constructor(private ctx: vsc.ExtensionContext) {}

  private _onDidChangeTreeData: vsc.EventEmitter<
    Entry | undefined | null | void
  > = new vsc.EventEmitter<Entry | undefined | null | void>();

  readonly onDidChangeTreeData: vsc.Event<Entry | undefined | null | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

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
    const contract = ProjectsState.instance.value;
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
          new ProjectEntry(p.name, vsc.TreeItemCollapsibleState.Expanded, p),
      ),
    );
  }
}
