import { merge } from 'lodash/fp';
import React from 'react';
import { ScrollView } from 'react-native';
import {
  Assets, Button, ButtonProps, Colors, FloatingButton, Text, View,
} from 'react-native-ui-lib';
import { ISettings, SettingsActionType, SettingsContext } from '../../../core/settings';
import { IPowerSettings, IThermalSettings } from '../../../core/settings/settings.interface';

const SettingsPowerCard = React.lazy(() => import('../containers/settings/settings-power.card'));
const SettingsThermalCard = React.lazy(() => import('../containers/settings/settings-thermal.card'));
const SettingsOthersCard = React.lazy(() => import('../containers/settings/settings-others.card'));

const actionsButtonDefault: ButtonProps = {
  label: 'Menu',
  iconSource: Assets.icons.barsOpen,
  iconStyle: {
    width: 22,
    height: 22,
    margin: 0,
    tintColor: Colors.$iconDefaultLight,
  },
};

const SettingsScreen: React.FC = () => {
  const { settings, settingsDispatcher } = React.useContext(SettingsContext);

  const [localSettings, setLocalSettings] = React.useState<ISettings>(settings);
  const [savedSettings, setSavedSettings] = React.useState<ISettings>(settings);

  // Settings are loaded asynchronously. Keep the editor in sync while it is
  // clean, but do not overwrite edits that are waiting to be saved.
  React.useEffect(() => {
    if (localSettings === savedSettings) {
      setLocalSettings(settings);
    }
    setSavedSettings(settings);
  }, [localSettings, savedSettings, settings]);

  const hasChanges = localSettings !== savedSettings;

  const handleUpdate = (data: Partial<ISettings>) => {
    settingsDispatcher({
      type: SettingsActionType.UPDATE,
      value: data,
    });
  };

  const handleLocalUpdate = (data: Partial<ISettings>) => {
    setLocalSettings((prevState) => merge(prevState, data));
  };

  const handlePowerUpdate = (data: Partial<IPowerSettings>) => {
    handleLocalUpdate({
      power: merge(localSettings?.power, data),
    });
  };

  const handleThermalUpdate = (data: Partial<IThermalSettings>) => {
    handleLocalUpdate({
      thermal: merge(localSettings?.thermal, data),
    });
  };

  const [actionsVisible, setActionVisible] = React.useState<boolean>(false);
  const actionsButtonProps = React.useMemo<ButtonProps>(() => (
    actionsVisible
      ? {
        ...actionsButtonDefault,
        backgroundColor: Colors.$backgroundPrimaryHeavy,
      }
      : {
        iconSource: Assets.icons.barsClose,
        iconStyle: {
          width: 15,
          height: 15,
          margin: 8,
          tintColor: Colors.$iconDefaultLight,
        },
        backgroundColor: Colors.$backgroundPrimaryHeavy,
      }
  ), [actionsVisible]);

  return (
    <View bg-screenBG flex>
      <View
        row
        spread
        paddingV-10
        paddingH-10
        centerV
      >
        <View row centerV>
          <Text text60>Settings</Text>
        </View>
        <Button
          size={Button.sizes.small}
          onPress={() => setActionVisible(!actionsVisible)}
          animateLayout
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...actionsButtonProps}
        />
      </View>
      {hasChanges && (
        <View paddingV-10 paddingT-0 center>
          <Text text90 $textDanger>
            Please save changes using the Menu button
          </Text>
        </View>
      )}
      <View
        flex
        paddingH-10
        paddingB-10
        useSafeArea
        style={{ zIndex: 0 }}
      >
        <ScrollView>
          <SettingsPowerCard settings={localSettings?.power} onUpdate={handlePowerUpdate} />
          <View height={10} />
          <SettingsThermalCard settings={localSettings?.thermal} onUpdate={handleThermalUpdate} />
          <View height={10} />
          <SettingsOthersCard settings={localSettings} onUpdate={handleLocalUpdate} />
        </ScrollView>
      </View>
      <FloatingButton
        duration={500}
        visible={actionsVisible}
        button={{
          size: Button.sizes.large,
          disabled: !hasChanges,
          onPress: () => {
            if (localSettings) {
              handleUpdate(localSettings);
              setSavedSettings(localSettings);
            }
            setActionVisible(false);
          },
          backgroundColor: Colors.$backgroundPrimaryHeavy,
          label: 'Save Changes',
          iconSource: Assets.icons.save,
          iconStyle: {
            display: 'flex',
            width: 16,
            height: 20,
            tintColor: Colors.$iconDefaultLight,
          },
        }}
      />
    </View>
  );
};

export default SettingsScreen;
