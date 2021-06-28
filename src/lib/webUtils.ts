import getExtensionConfig from '../state/getExtensionConfig';

export function getTierPrefix(): string {
  const tier = getExtensionConfig().web.tier;
  return tier === 'prod' ? '' : `${tier}.`;
}
