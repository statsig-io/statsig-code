import * as vsc from 'vscode';
import { renderConfigInMarkdown } from '../lib/configUtils';
import { CONFIG_NAME_WITH_QUOTES_REGEX } from '../lib/languageUtils';
import ProjectsState from '../state/ProjectsState';
import * as fetchConfigs from '../commands/fetchConfigs';

export default class ConfigHoverProvider implements vsc.HoverProvider {
  provideHover(
    document: vsc.TextDocument,
    position: vsc.Position,
  ): vsc.ProviderResult<vsc.Hover> {
    const range = document.getWordRangeAtPosition(
      position,
      CONFIG_NAME_WITH_QUOTES_REGEX,
    );

    const token = document.getText(range);
    if (token.length < 6 || token.length > 52) {
      return null;
    }

    const name = token.substring(1, token.length - 1);
    const maybeOutdatedConfigs = ProjectsState.instance.findConfig(name);

    return (async () => {
      let configs = maybeOutdatedConfigs;
      if (maybeOutdatedConfigs.length === 0) {
        await fetchConfigs.run({
          throttle: true,
          silent: true,
          incremental: true,
        });

        const updatedConfigs = ProjectsState.instance.findConfig(name);
        if (updatedConfigs.length === 0) {
          return null;
        }
        configs = updatedConfigs;
      }

      return {
        contents: configs.map((c) =>
          renderConfigInMarkdown(c, configs.length > 1),
        ),
      };
    })();
  }
}
