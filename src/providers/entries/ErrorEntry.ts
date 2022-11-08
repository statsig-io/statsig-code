import * as vsc from 'vscode';
import { Entry } from './Entry';

const alertIcon = new vsc.ThemeIcon('alert');

export class ErrorEntry extends Entry {
  constructor(public readonly label: string) {
    super(label, vsc.TreeItemCollapsibleState.None, {});
  }

  getParent(): Thenable<Entry | null> {
    return Promise.resolve(null);
  }

  getChildren(): Thenable<Entry[]> {
    return Promise.resolve([]);
  }

  iconPath = alertIcon;
}
