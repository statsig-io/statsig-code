export const CONFIG_NAME_REGEX = /[a-zA-Z0-9_ ]+/;
export const CONFIG_NAME_WITH_QUOTES_REGEX = /["'`][a-zA-Z0-9_ ]+["'`]/;

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
      return /[a-zA-Z0-9_]+[.]+checkGate+\(+[^)]+\)/;
  }
}

export function getStatsigAPIGetConfigRegex(
  language: SupportedLanguageType,
): RegExp {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return /[a-zA-Z0-9_]+[.]+getConfig+\(+[^)]+\)/;
  }
}
