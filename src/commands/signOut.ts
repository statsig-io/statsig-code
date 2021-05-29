import * as vsc from 'vscode';
import AuthState from '../state/AuthState';
import ProjectsState from '../state/ProjectsState';

export default async function run(): Promise<void> {
  await Promise.all([
    AuthState.instance.clear(),
    ProjectsState.instance.clear(),
  ]);
}

export function register(): vsc.Disposable {
  return vsc.commands.registerCommand(
    'statsig.signOut',
    async () => await run(),
  );
}
