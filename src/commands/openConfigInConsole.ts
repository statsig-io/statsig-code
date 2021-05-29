import * as vsc from 'vscode';
import { getConfigUrl } from '../lib/configUtils';
import { CONFIG_NAME_REGEX } from '../lib/languageUtils';
import ProjectsState, { StatsigConfig } from '../state/ProjectsState';

export default async function run(arg?: string | StatsigConfig): Promise<void> {
  if (!arg) {
    return;
  }

  let config: StatsigConfig;
  if (typeof arg !== 'string') {
    config = arg;
  } else {
    const name = arg;
    const configs = ProjectsState.instance.findConfig(name);
    if (configs.length === 0) {
      void vsc.window.showErrorMessage(`No config found with name ${name}`);
      return;
    }

    if (configs.length === 1) {
      config = configs[0];
    } else {
      const projectName = await vsc.window.showQuickPick(
        configs.map((p) => p.projectName),
        {
          title: 'Select a project',
          canPickMany: false,
        },
      );

      if (projectName === undefined) {
        return;
      }

      const matchingConfig = configs.find((c) => c.projectName === projectName);
      if (!matchingConfig) {
        void vsc.window.showErrorMessage(
          `No config with name ${name} in the selected Project. This is an extension bug, please report it.`,
        );

        return;
      }

      config = matchingConfig;
    }
  }

  void vsc.env.openExternal(getConfigUrl(config));
}

export function register(): vsc.Disposable {
  return vsc.commands.registerCommand(
    'statsig.openConfigInConsole',
    async (name?: string) => {
      if (name) {
        await run(name);
        return;
      }

      let prefill = undefined;
      const selection = vsc.window.activeTextEditor?.selection;
      if (selection) {
        let range;
        if (selection.end.isAfter(selection.start)) {
          range = selection;
        } else {
          range = vsc.window.activeTextEditor?.document.getWordRangeAtPosition(
            selection.end,
            CONFIG_NAME_REGEX,
          );
        }

        if (range && range.isSingleLine) {
          prefill = vsc.window.activeTextEditor?.document.getText(range);
        }
      }

      await run(
        await vsc.window.showInputBox({
          title: 'Statsig: Open Config in Console',
          prompt:
            "Enter a config/gate name.  Hint: If your cursor is over a string, it'll be prefilled in.",
          placeHolder: 'enable_im_feeling_lucky',
          value: prefill,
          validateInput: (value: string) => {
            if (ProjectsState.instance.findConfig(value).length > 0) {
              return null;
            }

            return 'No config found with this name.';
          },
        }),
      );
    },
  );
}
