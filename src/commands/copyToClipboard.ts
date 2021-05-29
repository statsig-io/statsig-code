import * as vsc from 'vscode';
import { APIConfigEntry } from '../providers/entries/APIConfigEntry';
import { StatsigConfig } from '../state/ProjectsState';

export default function run(arg: string | StatsigConfig): void {
  const s = typeof arg === 'string' ? arg : arg.data.name;
  void vsc.env.clipboard.writeText(s);
}

export function register(): vsc.Disposable {
  return vsc.commands.registerCommand(
    'statsig.copyToClipboard',
    (s: APIConfigEntry) => run(s.data),
  );
}
