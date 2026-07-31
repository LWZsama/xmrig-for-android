import React from 'react';
import {
  Colors,
  TabController,
  View,
} from 'react-native-ui-lib';
import { ViewProps } from 'react-native';
import { LazyLoader } from '../core/lazy-loader';

const ConfigurationsScreen = React.lazy(() => import('./screens/configurations.screen'));
const LazyConfigurationsScreen = () => (<LazyLoader><ConfigurationsScreen /></LazyLoader>);

const SettingsScreen = React.lazy(() => import('./screens/settings.screen'));
const LazySettingsScreen = () => (<LazyLoader><SettingsScreen /></LazyLoader>);

export const TabNavigator:React.FC<ViewProps> = () => (
  <TabController items={[{ label: 'Configurations' }, { label: 'Settings' }]}>
    <View flex>
      <TabController.TabPage index={0}><LazyConfigurationsScreen /></TabController.TabPage>
      <TabController.TabPage index={1} lazy><LazySettingsScreen /></TabController.TabPage>
    </View>
    <View
      br30
      style={{
        overflow: 'hidden',
        borderColor: Colors.$outlinePrimary,
        borderTopWidth: 2,
        borderLeftWidth: 0.3,
        borderRightWidth: 0.3,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      <TabController.TabBar
        enableShadow
      />
    </View>
  </TabController>
);
