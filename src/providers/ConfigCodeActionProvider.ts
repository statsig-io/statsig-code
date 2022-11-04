import * as vsc from 'vscode';
import {
  getStatsigAPICheckGateRegex,
  getStatsigAPIGetConfigRegex,
  isLanguageSupported,
  SupportedLanguageType,
} from '../lib/languageUtils';
import { DiagnosticCode } from './diagnostics';

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
      .filter((diagnostic) => diagnostic.code === DiagnosticCode.staleCheck)
      .forEach((diagnostic) => {
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
    let success: boolean;
    [action.edit, success] = this.handleEdit(doc, range);
    const configName = doc.getText(range);
    action.command = {
      command: type.command,
      title: action.title,
      arguments: [configName, success],
    };
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    return action;
  }

  private handleEdit(
    doc: vsc.TextDocument,
    range: vsc.Range | vsc.Selection,
  ): [vsc.WorkspaceEdit, boolean] {
    let success = false;
    const edit = new vsc.WorkspaceEdit();
    const line = doc.lineAt(range.start.line);

    const checkGateMatch = getStatsigAPICheckGateRegex(
      doc.languageId as SupportedLanguageType,
    ).exec(line.text);

    if (checkGateMatch) {
      checkGateMatch.forEach((match) => {
        const matchIndex = line.text.indexOf(match);
        const matchRange = new vsc.Range(
          line.lineNumber,
          matchIndex,
          line.lineNumber,
          matchIndex + match.length,
        );
        edit.delete(doc.uri, matchRange);
        success = true;
      });
    }

    const getConfigMatch = getStatsigAPIGetConfigRegex(
      doc.languageId as SupportedLanguageType,
    ).exec(line.text);

    if (getConfigMatch) {
      getConfigMatch.forEach((match) => {
        const matchIndex = line.text.indexOf(match);
        const matchRange = new vsc.Range(
          line.lineNumber,
          matchIndex,
          line.lineNumber,
          matchIndex + match.length,
        );
        edit.delete(doc.uri, matchRange);
        success = true;
      });
    }

    return [edit, success];
  }
}

const removeStaleConfigCommandHandler = (config: string, success: boolean) => {
  if (success) {
    void vsc.window.showInformationMessage(`Removed ${config}`);
  } else {
    void vsc.window.showInformationMessage(`Could not remove ${config}`);
  }
};

export function registerCommands(context: vsc.ExtensionContext): void {
  context.subscriptions.push(
    vsc.commands.registerCommand(
      CODE_ACTIONS.removeStaleConfig.command,
      removeStaleConfigCommandHandler,
    ),
  );
}
