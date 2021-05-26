import * as vsc from 'vscode';
import { APIConfigEntity } from '../../contracts/projects';
import { Entry } from './Entry';

export const configDisabledIcon = new vsc.ThemeIcon(
  'circle-outline',
  new vsc.ThemeColor('charts.red'),
);

export abstract class APIConfigEntry extends Entry {
  constructor(
    public readonly projectID: string,
    public readonly data: APIConfigEntity,
  ) {
    super(data.name, vsc.TreeItemCollapsibleState.None, data);
  }

  getChildren(): Thenable<never[]> {
    return Promise.resolve([]);
  }

  contextValue = 'api_config';
}
