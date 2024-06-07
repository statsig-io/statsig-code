import * as vsc from 'vscode';

import { Entry } from './entries/Entry';
import { ErrorEntry } from './entries/ErrorEntry';
import { ProjectEntry } from './entries/ProjectEntry';
import ProjectsState from '../state/ProjectsState';

export default class ProjectsProvider implements vsc.TreeDataProvider<Entry> {
  private _onDidChangeTreeData: vsc.EventEmitter<
    Entry | undefined | null | void
  > = new vsc.EventEmitter<Entry | undefined | null | void>();

  readonly onDidChangeTreeData: vsc.Event<Entry | undefined | null | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getOnDidChangeTreeData(): vsc.Event<Entry | undefined | null | void> {
    return this.onDidChangeTreeData;
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

  getParent(element: Entry): Thenable<Entry | null> {
    return element.getParent();
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
    const mainProject = ProjectsState.instance.getMainProject();

    return Promise.resolve(
      projects.map(
        (p) =>
          new ProjectEntry(
            p.name === mainProject
              ? { label: p.name, highlights: [[0, p.name.length]] }
              : p.name,
            vsc.TreeItemCollapsibleState.Collapsed,
            p,
          ),
      ),
    );
  }
}
