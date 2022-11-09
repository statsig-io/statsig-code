import * as vsc from 'vscode';
import { ProjectEntry } from '../providers/entries/ProjectEntry';
import ProjectsState from '../state/ProjectsState';

export default function run(e: ProjectEntry): void {
  ProjectsState.instance.setMainProject(e.data.name);
}

export function register(): vsc.Disposable {
  return vsc.commands.registerCommand(
    'statsig.selectMainProject',
    (e: ProjectEntry) => run(e),
  );
}
