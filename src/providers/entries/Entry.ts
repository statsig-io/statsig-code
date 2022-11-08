import * as vsc from 'vscode';

export abstract class Entry extends vsc.TreeItem {
  constructor(
    public readonly label: string | vsc.TreeItemLabel,
    public readonly collapsibleState: vsc.TreeItemCollapsibleState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly data?: Record<string, any>,
    readonly parent?: Entry,
  ) {
    super(label, collapsibleState);
  }

  abstract getParent(): Thenable<Entry | null>;
  abstract getChildren(): Thenable<Entry[]>;
}
