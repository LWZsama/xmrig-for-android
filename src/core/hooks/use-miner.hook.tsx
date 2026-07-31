import React from 'react';
import _ from 'lodash';
import { NativeModules } from 'react-native';
import { SettingsContext } from '../settings';
import { Configuration } from '../settings/settings.interface';
import ConfigBuilder from '../xmrig-config/config-builder';

const { XMRigForAndroid } = NativeModules;

export interface IMinerSendCompiguration {
  id: string,
  name: string,
  mode: string,
  xmrig_fork: string,
  config: string,
}

export const useMiner = () => {
  const { settings } = React.useContext(SettingsContext);

  const startHandler = React.useCallback((config: IMinerSendCompiguration) => {
    XMRigForAndroid.start(JSON.stringify(config));
  }, []);

  const startWithSelectedConfigurationHandler = React.useCallback(() => {
    if (settings.selectedConfiguration) {
      const cConfig:Configuration | undefined = settings.configurations.find(
        (config) => config.id === settings.selectedConfiguration,
      );

      if (cConfig) {
        const sConfig = ConfigBuilder.build(cConfig);
        if (sConfig) {
          const sConfigPartial: Partial<IMinerSendCompiguration> = _.pick(
            cConfig,
            ['id', 'name', 'mode', 'xmrig_fork'],
          );
          sConfig.setProps({
            'donate-level': settings.donation,
            'print-time': settings.printTime,
          });

          startHandler({
            ...sConfigPartial,
            config: sConfig.getConfigBase64(),
          } as IMinerSendCompiguration);
        }
      }
    }
  }, [settings]);

  const stopHandler = React.useCallback(() => {
    XMRigForAndroid.stop();
  }, []);

  return {
    start: startHandler,
    startWithSelectedConfiguration: startWithSelectedConfigurationHandler,
    stop: stopHandler,
  };
};
