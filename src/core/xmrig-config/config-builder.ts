/* eslint-disable max-classes-per-file */
import _ from 'lodash';
import base64 from 'react-native-base64';
import * as JSON5 from 'json5';
import {
  Configuration,
  ConfigurationMode,
  IAdvanceConfiguration,
  ISimpleConfiguration,
} from '../settings/settings.interface';
import { config as configJson } from './config';

type Pool = {
    user: string;
    pass: string;
    url: string;
    tls: boolean;
}
class ConfigBuilderPrivate {
  config: Record<string, any> = _.cloneDeep(configJson);

  reset() {
    this.config = _.cloneDeep(configJson);
  }

  setConfig(data: Record<string, any>) {
    this.config = _.cloneDeep(data);
  }

  setPool(pool: Partial<Pool>) {
    this.config = {
      ...this.config,
      ...{
        pools: [
          {
            ...this.config.pools[0],
            ...pool,
          },
        ],
      },
    };
  }

  setProps(props: Record<string, any>) {
    this.config = _.merge(
      this.config,
      props,
    );
  }

  getConfigString() {
    return JSON.stringify(this.config);
  }

  getConfigBase64() {
    return base64.encode(this.getConfigString());
  }
}

export default class ConfigBuilder {
  public static build(configuration: Configuration): ConfigBuilderPrivate | null {
    if (!configuration) {
      return null;
    }
    const pConfig = new ConfigBuilderPrivate();

    if (configuration.mode === ConfigurationMode.SIMPLE) {
      const asSimpleConfig: ISimpleConfiguration = _.cloneDeep(configuration);
      pConfig.reset();
      pConfig.setPool({
        user: asSimpleConfig.properties?.pool?.username,
        pass: asSimpleConfig.properties?.pool?.password,
        url: `${asSimpleConfig.properties?.pool?.hostname}:${asSimpleConfig.properties?.pool?.port}`,
        tls: asSimpleConfig.properties?.pool?.sslEnabled,
      });
      pConfig.setProps({
        cpu: {
          priority: asSimpleConfig.properties?.cpu?.priority,
          yield: asSimpleConfig.properties?.cpu?.yield,
          'max-threads-hint': asSimpleConfig.properties?.cpu?.max_threads_hint,
        },
        randomx: {
          mode: asSimpleConfig.properties?.cpu?.random_x_mode,
        },
      });
      pConfig.setProps({
        cpu: {
          ...asSimpleConfig.properties?.algos,
        },
      });
      pConfig.setProps({
        'algo-perf': asSimpleConfig.properties?.algo_perf,
      });
    }

    if (configuration.mode === ConfigurationMode.ADVANCE) {
      const asAdvancedConfig: IAdvanceConfiguration = _.cloneDeep(configuration);
      pConfig.setConfig(JSON5.parse(asAdvancedConfig.config || '{}'));
      pConfig.setProps({
        http: {
          enabled: true,
        },
        background: false,
        colors: true,
      });
    }

    return pConfig;
  }
}
