import * as vsc from 'vscode';
import ProjectsProvider from '../providers/projects';

let ctx: vsc.ExtensionContext;
let prov: ProjectsProvider;

export default async function run(): Promise<void> {
  await Promise.all([
    ctx.globalState.update('auth', undefined),
    ctx.globalState.update('projects', undefined),
    ctx.globalState.update('projects.updateTime', undefined),
  ]);

  prov.refresh();
}

export function register(
  context: vsc.ExtensionContext,
  provider: ProjectsProvider,
): vsc.Disposable {
  ctx = context;
  prov = provider;
  return vsc.commands.registerCommand('statsig.signOut', async () => {
    await run();
  });
}
