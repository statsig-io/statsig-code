import getExtensionConfig from '../state/getExtensionConfig';

export function getTierPrefix(app: 'api' | 'console'): string {
  const tier = getExtensionConfig().web.tier;
  switch (tier) {
    case 'prod':
      return app;

    case 'latest':
      return `latest.${app}`;

    default:
      return tier;
  }
}
