import { IConfiguratioProperties, ISimpleConfiguration } from './settings.interface';

/**
 * Update only the changed configuration properties and retain references to
 * unrelated branches. This lets memoized editor cards avoid re-rendering when
 * a field in another card changes.
 */
export const updateSimpleConfigurationProperties = (
  configuration: ISimpleConfiguration,
  properties: Partial<IConfiguratioProperties>,
): ISimpleConfiguration => ({
  ...configuration,
  properties: {
    ...configuration.properties,
    ...properties,
  },
});
