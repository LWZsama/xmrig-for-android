import React from 'react';
import _ from 'lodash';
import { NativeModules } from 'react-native';
import { Incubator } from 'react-native-ui-lib';
import { SettingsContext } from '../settings';
import { Configuration } from '../settings/settings.interface';
import ConfigBuilder from '../xmrig-config/config-builder';
import { useToaster } from './use-toaster/use-toaster.hook';

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
  const toaster = useToaster();

  const reportStartError = React.useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error || 'Unknown error');
    console.error('Unable to start XMRig', error);
    toaster({
      message: `Unable to start mining: ${message}`,
      position: 'top',
      preset: Incubator.ToastPresets.FAILURE,
    });
  }, [toaster]);

  const startHandler = React.useCallback((config: IMinerSendCompiguration) => {
    try {
      const request = XMRigForAndroid.start(JSON.stringify(config));
      // Native start() is Promise-based so malformed configuration and
      // service startup errors are reported instead of becoming an unhandled
      // release-mode JS exception.
      if (request && typeof request.catch === 'function') {
        request.catch(reportStartError);
      }
    } catch (error) {
      reportStartError(error);
    }
  }, [reportStartError]);

  const startWithSelectedConfigurationHandler = React.useCallback(() => {
    if (settings.selectedConfiguration) {
      const cConfig:Configuration | undefined = settings.configurations.find(
        (config) => config.id === settings.selectedConfiguration,
      );

      if (cConfig) {
        try {
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
        } catch (error) {
          reportStartError(error);
        }
      }
    }
  }, [reportStartError, settings, startHandler]);

  const stopHandler = React.useCallback(() => {
    XMRigForAndroid.stop();
  }, []);

  return {
    start: startHandler,
    startWithSelectedConfiguration: startWithSelectedConfigurationHandler,
    stop: stopHandler,
  };
};
