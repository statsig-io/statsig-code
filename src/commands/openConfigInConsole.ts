import * as vsc from 'vscode';

export default function run(name?: string): void {
  if (!name) {
    return;
  }

  const type = name === 'feature_gate' ? 'gates' : 'dynamic_configs';
  void vsc.env.openExternal(
    vsc.Uri.parse(`https://console.statsig.com/${'projectID'}/${type}/${name}`),
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
