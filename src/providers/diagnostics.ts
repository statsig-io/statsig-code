import * as vsc from 'vscode';
import { getStaleConfig } from '../lib/configUtils';
import { CONFIG_NAME_WITH_QUOTES_REGEX } from '../lib/languageUtils';
import { StatsigConfig } from '../state/ProjectsState';

export enum DiagnosticCode {
  staleCheck = 'stale_check',
}

/**
 * Analyzes the text document for problems.
 * @param doc text document to analyze
 * @param diagnosticCollection diagnostic collection
 */
export function refreshDiagnostics(
  doc: vsc.TextDocument,
  diagnosticCollection: vsc.DiagnosticCollection,
): void {
  const diagnostics: vsc.Diagnostic[] = [];

  for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
    const lineOfText = doc.lineAt(lineIndex);
    const configSearch = CONFIG_NAME_WITH_QUOTES_REGEX.exec(lineOfText.text);
    if (configSearch !== null) {
      configSearch.forEach((match) => {
        const configName = match.substring(1, match.length - 1);
        getStaleConfig(configName).forEach((config) => {
          diagnostics.push(
            createDiagnostic(DiagnosticCode.staleCheck, {
              lineOfText,
              lineIndex,
              config,
              reason: '0 checks in the past 30 days',
            }),
          );
        });
      });
    }
  }

  diagnosticCollection.set(doc.uri, diagnostics);
}

function createDiagnostic(
  diagnosticCode: DiagnosticCode,
  metadata: {
    lineOfText: vsc.TextLine;
    lineIndex: number;
    config: StatsigConfig;
    reason?: string;
  },
): vsc.Diagnostic {
  let diagnostic: vsc.Diagnostic;
  switch (diagnosticCode) {
    case DiagnosticCode.staleCheck: {
      const { lineOfText, lineIndex, config, reason } = metadata;
      const configName = config.data.name;
      const index = lineOfText.text.indexOf(configName);

      const range = new vsc.Range(
        lineIndex,
        index,
        lineIndex,
        index + configName.length,
      );

      diagnostic = new vsc.Diagnostic(
        range,
        `${configName} may be stale. Consider removing from code ${
          reason ? `\n(${reason})` : ''
        }`,
        vsc.DiagnosticSeverity.Information,
      );
      diagnostic.code = DiagnosticCode.staleCheck;
    }
  }
  return diagnostic;
}

export function subscribeToDocumentChanges(
  context: vsc.ExtensionContext,
  diagnosticCollection: vsc.DiagnosticCollection,
): void {
  if (vsc.window.activeTextEditor) {
    refreshDiagnostics(
      vsc.window.activeTextEditor.document,
      diagnosticCollection,
    );
  }
  context.subscriptions.push(
    vsc.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        refreshDiagnostics(editor.document, diagnosticCollection);
      }
    }),
  );

  context.subscriptions.push(
    vsc.workspace.onDidChangeTextDocument((e) =>
      refreshDiagnostics(e.document, diagnosticCollection),
    ),
  );

  context.subscriptions.push(
    vsc.workspace.onDidCloseTextDocument((doc) =>
      diagnosticCollection.delete(doc.uri),
    ),
  );
}
