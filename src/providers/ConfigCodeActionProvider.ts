/* eslint-disable @typescript-eslint/prefer-regexp-exec */
import * as vsc from 'vscode';
import { getStaleConfigWithReason } from '../lib/configUtils';
import {
  checkGateReplacement,
  getConfigReplacement,
  getExperimentReplacement,
  getStatsigAPICheckGateRegex,
  getStatsigAPIGetConfigRegex,
  getStatsigAPIGetExperimentRegex,
  getVariableAssignmentRegex,
  isLanguageSupported,
  nthIndexOf,
  SupportedLanguageType,
  SUPPORTED_FILE_EXTENSIONS,
} from '../lib/languageUtils';
import { DiagnosticCode, findStaleConfigs } from './diagnostics';

type CodeActionType = {
  command: string;
  title: string;
  kind: vsc.CodeActionKind;
};

export const CODE_ACTIONS: Record<string, CodeActionType> = {
  removeStaleConfig: {
    command: 'remove-stale-config',
    title: 'Cleanup',
    kind: vsc.CodeActionKind.QuickFix,
  },
};

export class ConfigCodeActionProvider implements vsc.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vsc.CodeActionKind.QuickFix,
  ];

  provideCodeActions(
    doc: vsc.TextDocument,
    range: vsc.Range | vsc.Selection,
    context: vsc.CodeActionContext,
    _token: vsc.CancellationToken,
  ): vsc.ProviderResult<(vsc.CodeAction | vsc.Command)[]> {
    if (!isLanguageSupported(doc.languageId)) {
      return [];
    }

    const actions: vsc.CodeAction[] = [];
    context.diagnostics
      .filter(
        (diagnostic: vsc.Diagnostic) =>
          diagnostic.code === DiagnosticCode.staleCheck,
      )
      .forEach((diagnostic: vsc.Diagnostic) => {
        actions.push(
          this.newCodeAction(doc, range, diagnostic, {
            ...CODE_ACTIONS.removeStaleConfig,
          }),
        );
      });
    return actions;
  }

  private newCodeAction(
    doc: vsc.TextDocument,
    range: vsc.Range | vsc.Selection,
    diagnostic: vsc.Diagnostic,
    type: CodeActionType,
  ): vsc.CodeAction {
    const action = new vsc.CodeAction(type.title, type.kind);
    const edit = new vsc.WorkspaceEdit();
    const configName = doc.getText(range);
    const success = ConfigCodeActionProvider.handleEdit(
      doc,
      edit,
      [configName],
      range,
    );
    action.edit = edit;
    action.command = {
      command: type.command,
      title: action.title,
      arguments: [configName, success],
    };
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    return action;
  }

  private static getReplacementValue(
    configName: string,
  ): boolean | Record<string, unknown> | null {
    const staleConfig = getStaleConfigWithReason(configName);
    if (staleConfig) {
      switch (staleConfig.config.type) {
        case 'dynamic_config':
          return staleConfig.configReplacement;
        case 'feature_gate':
          return staleConfig.gateReplacement;
      }
    }
    return null;
  }

  public static handleEdit(
    doc: vsc.TextDocument,
    edit: vsc.WorkspaceEdit,
    configs: string[],
    range?: vsc.Range | vsc.Selection,
  ): boolean {
    let changesMade = false;
    let searchableText = doc.getText();
    let offset = 0;
    if (range) {
      const line = doc.lineAt(range.start.line);
      searchableText = line.text;
      offset = doc.offsetAt(line.range.start);
    }
    const language = doc.languageId as SupportedLanguageType;
    const seen: { [key: string]: number } = {};

    const uniqueConfigs = new Set(configs);
    uniqueConfigs.forEach((config) => {
      const addReplacementEdit = (
        matches: RegExpMatchArray | null,
        replacement: string,
      ): void => {
        if (!matches) {
          return;
        }
        for (const match of matches) {
          seen[match] ? ++seen[match] : (seen[match] = 1);
          const matchIndex =
            nthIndexOf(searchableText, match, seen[match]) + offset;
          const matchRange = new vsc.Range(
            doc.positionAt(matchIndex),
            doc.positionAt(matchIndex + match.length),
          );
          edit.replace(doc.uri, matchRange, replacement);
          changesMade = true;
        }
      };
      const checkGateMatch = searchableText.match(
        getStatsigAPICheckGateRegex(language, config),
      );
      addReplacementEdit(
        checkGateMatch,
        checkGateReplacement(
          language,
          this.getReplacementValue(config) as boolean,
        ),
      );

      const getConfigMatch = searchableText.match(
        getStatsigAPIGetConfigRegex(language, config),
      );
      addReplacementEdit(
        getConfigMatch,
        getConfigReplacement(
          language,
          this.getReplacementValue(config) as Record<string, unknown>,
        ),
      );

      const getExperimentMatch = searchableText.match(
        getStatsigAPIGetExperimentRegex(language, config),
      );
      addReplacementEdit(
        getExperimentMatch,
        getExperimentReplacement(
          language,
          this.getReplacementValue(config) as Record<string, unknown>,
        ),
      );

      const variableAssignmentMatch = searchableText.match(
        getVariableAssignmentRegex(language, config),
      );
      if (variableAssignmentMatch) {
        for (const match of variableAssignmentMatch) {
          seen[match] ? ++seen[match] : (seen[match] = 1);
          const matchIndex =
            nthIndexOf(searchableText, match, seen[match]) + offset;
          const line = doc.lineAt(doc.positionAt(matchIndex).line);
          edit.delete(doc.uri, line.rangeIncludingLineBreak);
          changesMade = true;
        }
      }
    });

    return changesMade;
  }
}

const removeStaleConfigCommandHandler = (config: string, success: boolean) => {
  if (success) {
    void vsc.window.showInformationMessage(`Removed ${config}`);
  } else {
    void vsc.window.showInformationMessage(`Could not remove ${config}`);
  }
};

const removeAllStaleConfgsCommandHandler = async (
  output: vsc.OutputChannel,
) => {
  const edit = new vsc.WorkspaceEdit();
  const files = await vsc.workspace.findFiles(
    `**/*.{${SUPPORTED_FILE_EXTENSIONS.join()}}`,
  );
  const cleanedFiles = [];
  const configCounts: { [key: string]: number } = {};
  for (const file of files) {
    const doc = await vsc.workspace.openTextDocument(file);
    const staleConfigs = findStaleConfigs(doc);
    if (staleConfigs.length === 0) {
      continue;
    }
    if (ConfigCodeActionProvider.handleEdit(doc, edit, staleConfigs)) {
      staleConfigs.forEach((config) => {
        configCounts[config]
          ? ++configCounts[config]
          : (configCounts[config] = 1);
      });
      cleanedFiles.push(file.path);
      output.appendLine(`(success) ${file.path}`);
    } else {
      output.appendLine(`(failed) ${file.path}`);
    }
  }
  output.appendLine('');
  output.appendLine('Summary of Instances Removed: ');
  Object.entries(configCounts)
    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
    .forEach((counts: [string, number]) => {
      output.appendLine(`${counts[0]}: ${counts[1]}`);
    });
  const success = await vsc.workspace.applyEdit(edit);
  await vsc.workspace.saveAll();
  output.show();
  if (success) {
    await vsc.window.showInformationMessage(
      `Cleaned up ${cleanedFiles.length} ${
        cleanedFiles.length === 1 ? 'file' : 'files'
      }`,
    );
  } else {
    await vsc.window.showInformationMessage('Something went wrong');
  }
};

export function registerCommands(
  context: vsc.ExtensionContext,
  output: vsc.OutputChannel,
): void {
  context.subscriptions.push(
    vsc.commands.registerCommand(
      CODE_ACTIONS.removeStaleConfig.command,
      removeStaleConfigCommandHandler,
    ),
    vsc.commands.registerCommand('statsig.cleanupStale', () =>
      removeAllStaleConfgsCommandHandler(output),
    ),
  );
}
