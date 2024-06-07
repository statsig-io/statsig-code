import * as vsc from 'vscode';

import { APIConfigEntry } from '../providers/entries/APIConfigEntry';
import { StatsigConfig } from '../state/ProjectsState';
import { mp } from '../icons/index';

export default async function run(e: StatsigConfig): Promise<void> {
  mp.set(
    `${e.projectName},${e.type},${e.data.name}`,
    !(mp.get(`${e.projectName},${e.type},${e.data.name}`) ?? false),
  );
  await vsc.commands.executeCommand(
    'statsig.toggleData',
    `${e.projectName},${e.data.name}`,
  );
  await vsc.commands.executeCommand('statsig.refreshViews');
}

export function register(): vsc.Disposable {
  return vsc.commands.registerCommand(
    'statsig.toggleFavourite',
    (s: APIConfigEntry) => run(s.data),
  );
}
