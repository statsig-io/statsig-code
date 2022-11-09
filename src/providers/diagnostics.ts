/* eslint-disable @typescript-eslint/prefer-regexp-exec */
import * as vsc from 'vscode';
import { getStaleConfigWithReason } from '../lib/configUtils';
import { CONFIG_NAME_WITH_QUOTES_REGEX } from '../lib/languageUtils';

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
  findStaleConfigs(doc, diagnostics);
  diagnosticCollection.set(doc.uri, diagnostics);
}

export function findStaleConfigs(
  doc: vsc.TextDocument,
  diagnostics?: vsc.Diagnostic[],
): string[] {
  const staleConfigs: string[] = [];
  for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
    const lineOfText = doc.lineAt(lineIndex);
    const configSearch = lineOfText.text.match(CONFIG_NAME_WITH_QUOTES_REGEX);
    if (configSearch !== null) {
      configSearch.forEach((match) => {
        const configName = match.substring(1, match.length - 1);
        const staleConfig = getStaleConfigWithReason(configName);
        if (staleConfig) {
          staleConfigs.push(configName);
          const quoteOffset = match.indexOf(configName);
          const index = lineOfText.text.indexOf(match) + quoteOffset;
          const range = new vsc.Range(
            lineIndex,
            index,
            lineIndex,
            index + configName.length,
          );
          diagnostics?.push(
            createDiagnostic(DiagnosticCode.staleCheck, {
              range,
              configName,
              reason: staleConfig.reason,
            }),
          );
        }
      });
    }
  }
  return staleConfigs;
}

function createDiagnostic(
  diagnosticCode: DiagnosticCode,
  metadata: {
    range: vsc.Range;
    configName: string;
    reason?: string;
  },
): vsc.Diagnostic {
  let diagnostic: vsc.Diagnostic;
  switch (diagnosticCode) {
    case DiagnosticCode.staleCheck: {
      const { range, configName, reason } = metadata;

      diagnostic = new vsc.Diagnostic(
        range,
        `${configName} may be stale. Consider removing from code ${
          reason ? `\n(${reason})` : ''
        }`,
        vsc.DiagnosticSeverity.Information,
      );
      diagnostic.code = DiagnosticCode.staleCheck;
      diagnostic.source = configName;
    }
  }
  return diagnostic;
}

export function subscribeToDocumentChanges(
  context: vsc.ExtensionContext,
  diagnosticCollection: vsc.DiagnosticCollection,
  additionalListeners: vsc.Event<unknown>[] = [],
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

  additionalListeners.forEach((listener) => {
    context.subscriptions.push(
      listener(() => {
        if (vsc.window.activeTextEditor) {
          refreshDiagnostics(
            vsc.window.activeTextEditor.document,
            diagnosticCollection,
          );
        }
      }),
    );
  });
}
