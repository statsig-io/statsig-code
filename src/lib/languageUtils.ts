export const CONFIG_NAME_REGEX = /[a-zA-Z0-9_ ]+/g;
export const CONFIG_NAME_WITH_QUOTES_REGEX = /["'`][a-zA-Z0-9_ ]+["'`]/g;

const SUPPORTED_LANGUAGES = ['javascript', 'typescript'] as const;
export type SupportedLanguageType = typeof SUPPORTED_LANGUAGES[number];

export function isLanguageSupported(language: string): boolean {
  return (SUPPORTED_LANGUAGES as unknown as string[]).includes(language);
}

export function getStatsigAPICheckGateRegex(
  language: SupportedLanguageType,
): RegExp {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return /[a-zA-Z0-9_]+[.]+checkGate+\(+[^)]+\)/g;
  }
}

export function getStatsigAPIGetConfigRegex(
  language: SupportedLanguageType,
): RegExp {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return /[a-zA-Z0-9_]+[.]+getConfig+\(+[^)]+\)/g;
  }
}

export function getVariableAssignmentRegex(
  language: SupportedLanguageType,
): RegExp {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return /[=][\s]?["'`][a-zA-Z0-9_ ]+["'`]/g;
  }
}

export function checkGateReplacement(language: SupportedLanguageType): string {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return 'false';
  }
}

export function getConfigReplacement(language: SupportedLanguageType): string {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return '{}';
  }
}
