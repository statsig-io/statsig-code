import * as vsc from 'vscode';

export abstract class Entry extends vsc.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vsc.TreeItemCollapsibleState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly data: Record<string, any>,
  ) {
    super(label, collapsibleState);
  }

  abstract getChildren(): Thenable<Entry[]>;
}
