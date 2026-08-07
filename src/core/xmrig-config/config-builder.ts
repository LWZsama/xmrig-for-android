/* eslint-disable max-classes-per-file */
import _ from 'lodash';
import base64 from 'react-native-base64';
import * as JSON5 from 'json5';
import {
  Configuration,
  ConfigurationMode,
  Algorithm,
  IAdvanceConfiguration,
  IConfiguratioPropertiesCPU,
  ISimpleConfiguration,
  RandomXMode,
} from '../settings/settings.interface';
import { config as configJson } from './config';

type Pool = {
    user: string;
    pass: string;
    url: string;
    tls: boolean;
}

export type CpuTopology = {
  processors?: number;
  allAffinity?: string;
  performanceAffinity?: string;
  performanceThreads?: number;
};

const buildRandomXProfile = (
  cpu?: IConfiguratioPropertiesCPU,
  topology?: CpuTopology,
): Record<string, number | string> | undefined => {
  const processors = Math.floor(Number(topology?.processors));
  if (!Number.isFinite(processors) || processors < 1) {
    return undefined;
  }

  const hint = Math.min(
    100,
    Math.max(1, Number(cpu?.max_threads_hint) || 100),
  );
  const threads = Math.max(
    1,
    Math.min(processors, Math.ceil((processors * hint) / 100)),
  );
  const performanceThreads = Math.floor(Number(topology?.performanceThreads));
  const affinity = topology?.performanceAffinity
    && Number.isFinite(performanceThreads)
    && performanceThreads >= threads
    ? topology.performanceAffinity
    : topology?.allAffinity;

  return {
    threads,
    ...(affinity ? { affinity } : {}),
  };
};

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
  public static build(
    configuration: Configuration,
    cpuTopology?: CpuTopology,
  ): ConfigBuilderPrivate | null {
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
      const simpleCpu = asSimpleConfig.properties?.cpu;
      const priority = Number(simpleCpu?.priority);
      const maxThreadsHint = Number(simpleCpu?.max_threads_hint);
      const rxProfile = buildRandomXProfile(simpleCpu, cpuTopology);
      const cpuProps = {
        priority: Number.isFinite(priority) && priority >= 1 && priority <= 5 ? priority : 2,
        yield: simpleCpu?.yield ?? false,
        'max-threads-hint': Number.isFinite(maxThreadsHint)
          ? Math.min(100, Math.max(1, maxThreadsHint))
          : 100,
      };
      pConfig.setProps({
        cpu: {
          ...cpuProps,
        },
        randomx: {
          mode: simpleCpu?.random_x_mode || RandomXMode.AUTO,
        },
      });
      pConfig.setProps({
        cpu: {
          ...asSimpleConfig.properties?.algos,
        },
      });
      if (rxProfile && asSimpleConfig.properties?.algos?.[Algorithm.RX] !== false) {
        pConfig.setProps({
          cpu: {
            rx: rxProfile,
          },
        });
      }
      pConfig.setProps({
        'algo-perf': asSimpleConfig.properties?.algo_perf,
      });
    }

    if (configuration.mode === ConfigurationMode.ADVANCE) {
      const asAdvancedConfig: IAdvanceConfiguration = _.cloneDeep(configuration);
      const advancedConfig = JSON5.parse(asAdvancedConfig.config || '{}');
      pConfig.setConfig(_.merge(
        {
          randomx: {
            mode: RandomXMode.AUTO,
          },
          cpu: {
            'huge-pages': true,
            priority: 2,
            yield: false,
            asm: true,
          },
          verbose: 0,
        },
        advancedConfig,
      ));
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
