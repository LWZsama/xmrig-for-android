import React from 'react';
import {
  Card, Switch, Text, View,
} from 'react-native-ui-lib';
import { SettingsCardProps } from '.';
import { IPowerSettings } from '../../../../core/settings/settings.interface';

const SettingsPowerCard:React.FC<SettingsCardProps<IPowerSettings>> = ({
  settings,
  onUpdate,
}) => (
  <Card enableShadow>
    <View centerV spread padding-20 paddingB-5>
      <Card.Section
        style={{ flexShrink: 1 }}
        content={[
          { text: 'Power', text65: true, $textDefault: true },
          { text: 'Pause / Resume mining based on Battery level/device Charging.', text90: true, $textNeutral: true },
        ]}
      />
    </View>
    <View spread padding-20 paddingT-10>
      <View marginB-10>
        <View flex marginB-5>
          <Text text75 $textDefault flex column row>Pause mining on</Text>
          <Text text100 $textDefault row>
            Will pause the miner, can be resumed from the same point
          </Text>
        </View>
        <View row flex paddingL-10 marginB-5>
          <Text text80 $textNeutralLight flex column marginB-5>Charger Disconnected</Text>
          <Switch
            value={settings.pauseOnChargerDisconnected}
            onValueChange={(value) => onUpdate({ pauseOnChargerDisconnected: value })}
          />
        </View>
        <View row flex paddingL-10>
          <Text text80 $textNeutralLight flex column marginB-5>Low Battery</Text>
          <Switch
            value={settings.pauseOnLowBattery}
            onValueChange={(value) => onUpdate({ pauseOnLowBattery: value })}
          />
        </View>
      </View>
      <View marginB-10>
        <View flex marginB-5>
          <Text text75 $textDefault flex column row>Resume mining on</Text>
          <Text text100 $textDefault row>
            Will resume the mining, will be resumed only if paused
          </Text>
        </View>
        <View row flex paddingL-10 marginB-5>
          <Text text80 $textNeutralLight flex column marginB-5>Charger Connected</Text>
          <Switch
            value={settings.resumeOnChargerConnected}
            onValueChange={(value) => onUpdate({ resumeOnChargerConnected: value })}
          />
        </View>
        <View row flex paddingL-10>
          <Text text80 $textNeutralLight flex column marginB-5>Battery Ok</Text>
          <Switch
            value={settings.resumeOnBatteryOk}
            onValueChange={(value) => onUpdate({ resumeOnBatteryOk: value })}
          />
        </View>
      </View>
    </View>
  </Card>
);

export default SettingsPowerCard;
