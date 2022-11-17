export const CONFIG_NAME_REGEX = /[a-zA-Z0-9_ ]+/g;
export const CONFIG_NAME_WITH_QUOTES_REGEX = /["'`][a-zA-Z0-9_ ]+["'`]/g;

// https://code.visualstudio.com/docs/languages/identifiers
const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'go',
  'ruby',
  'java',
  'kotlin',
] as const;
export type SupportedLanguageType = typeof SUPPORTED_LANGUAGES[number];
export const SUPPORTED_FILE_EXTENSIONS = [
  'js',
  'ts',
  'py',
  'go',
  'rb',
  'java',
  'kt',
];

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
    case 'python':
      return new RegExp(
        `[a-zA-Z0-9_]*[.]*check_gate\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
    case 'go':
      return new RegExp(
        `[a-zA-Z0-9_]*[.]*CheckGate\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
    case 'ruby':
      return new RegExp(
        `[a-zA-Z0-9_]*[.]*check_gate\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
    case 'java':
      return new RegExp(
        `[a-zA-Z0-9_]+[.]checkGate(Async)?\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
    case 'kotlin':
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
    case 'python':
      return new RegExp(
        `[a-zA-Z0-9_]+[.]get_config\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
    case 'go':
      return new RegExp(
        `[a-zA-Z0-9_]*[.]*GetConfig\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
    case 'ruby':
      return new RegExp(
        `[a-zA-Z0-9_]*[.]*get_config\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
    case 'java':
      return new RegExp(
        `[a-zA-Z0-9_]+[.]getConfig(Async)?\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
    case 'kotlin':
      return new RegExp(
        `[a-zA-Z0-9_]+[.]getConfig\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
  }
}

export function getStatsigAPIGetExperimentRegex(
  language: SupportedLanguageType,
  configName: string,
): RegExp {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return new RegExp(
        `[a-zA-Z0-9_]+[.]getExperiment\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
    case 'python':
      return new RegExp(
        `[a-zA-Z0-9_]+[.]get_experiment\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
    case 'go':
      return new RegExp(
        `[a-zA-Z0-9_]*[.]*GetExperiment\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
    case 'ruby':
      return new RegExp(
        `[a-zA-Z0-9_]*[.]*get_experiment\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
    case 'java':
      return new RegExp(
        `[a-zA-Z0-9_]+[.]getExperiment(Async)?\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
        'g',
      );
    case 'kotlin':
      return new RegExp(
        `[a-zA-Z0-9_]+[.]getExperiment\\([^)]*["'\`]${configName}["'\`][^)]*\\)`,
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
    case 'python':
    case 'ruby':
    case 'java':
    case 'kotlin':
      return new RegExp(`[=][\\s]?["'\`]${configName}["'\`]`, 'g');
    case 'go':
      return new RegExp(`(=|:=)[\\s]?["'\`]${configName}["'\`]`, 'g');
  }
}

export function checkGateReplacement(
  language: SupportedLanguageType,
  value?: boolean,
): string {
  switch (language) {
    case 'javascript':
    case 'typescript':
    case 'go':
    case 'ruby':
    case 'java':
    case 'kotlin':
      return String(value) ?? 'false';
    case 'python':
      return value === true ? 'True' : 'False';
  }
}

export function getConfigReplacement(
  language: SupportedLanguageType,
  value?: Record<string, unknown>,
): string {
  switch (language) {
    case 'javascript':
    case 'typescript':
    case 'python':
    case 'ruby':
      return String(value) ?? '{}';
    case 'go':
      return String(value) ?? 'nil';
    case 'java':
    case 'kotlin':
      return String(value) ?? 'null';
  }
}

export function getExperimentReplacement(
  language: SupportedLanguageType,
  value?: Record<string, unknown>,
): string {
  switch (language) {
    case 'javascript':
    case 'typescript':
    case 'python':
    case 'ruby':
      return String(value) ?? '{}';
    case 'go':
      return String(value) ?? 'nil';
    case 'java':
    case 'kotlin':
      return String(value) ?? 'null';
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
