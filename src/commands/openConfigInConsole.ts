import * as vsc from 'vscode';
import ProjectsState from '../state/ProjectsState';

export default function run(name?: string): void {
  if (!name) {
    return;
  }

  const configs = ProjectsState.instance.findConfig(name);
  if (configs === null || configs.length === 0) {
    void vsc.window.showErrorMessage(`No config found with name ${name}`);
    return;
  }

  if (configs.length > 1) {
    void vsc.window.showErrorMessage(
      `Multiple configs found for name ${name}.  Unfortunately, Rodrigo hasn't implemented config selection yet.`,
    );
    return;
  }

  const config = configs[0];
  const type = config.type === 'feature_gate' ? 'gates' : 'dynamic_configs';
  void vsc.env.openExternal(
    vsc.Uri.parse(
      `https://console.statsig.com/${config.projectID}/${type}/${name}`,
    ),
  );
}

export function register(_context: vsc.ExtensionContext): vsc.Disposable {
  return vsc.commands.registerCommand(
    'statsig.openConfigInConsole',
    async (name?: string) => {
      if (!name) {
        name = await vsc.window.showInputBox({
          title: 'Statsig: Open Config in Console',
          prompt:
            "Enter a config/gate name.  Hint: If your cursor is over a string, it'll be prefilled in.",
          placeHolder: 'enable_im_feeling_lucky',
        });
      }

      run(name);
    },
  );
}
