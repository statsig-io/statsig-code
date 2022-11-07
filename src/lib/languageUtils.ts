export const CONFIG_NAME_REGEX = /[a-zA-Z0-9_ ]+/g;
export const CONFIG_NAME_WITH_QUOTES_REGEX = /["'`][a-zA-Z0-9_ ]+["'`]/g;

const SUPPORTED_LANGUAGES = ['javascript', 'typescript'] as const;
export type SupportedLanguageType = typeof SUPPORTED_LANGUAGES[number];
export const SUPPORTED_FILE_EXTENSIONS = ['js', 'ts'];

export function isLanguageSupported(language: string): boolean {
  return (SUPPORTED_LANGUAGES as unknown as string[]).includes(language);
}

export function getStatsigAPICheckGateRegex(
  language: SupportedLanguageType,
  configName: string,
): RegExp {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return new RegExp(
        `[a-zA-Z0-9_]+[.]checkGate\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
  }
}

export function getStatsigAPIGetConfigRegex(
  language: SupportedLanguageType,
  configName: string,
): RegExp {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return new RegExp(
        `[a-zA-Z0-9_]+[.]getConfig\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
  }
}

export function getVariableAssignmentRegex(
  language: SupportedLanguageType,
  configName: string,
): RegExp {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return new RegExp(`[=][\\s]?["'\`]${configName}["'\`]`, 'g');
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

export function nthIndexOf(base: string, search: string, n = 1): number {
  const length = base.length;
  let index = -1;
  while (n-- && index++ < length) {
    index = base.indexOf(search, index);
    if (index < 0) {
      break;
    }
  }
  return index;
}
