import { useNavigation, useRoute } from '@react-navigation/native';
import React, { Suspense } from 'react';
import {
  Assets, Button, ButtonProps, Colors, FloatingButton, LoaderScreen, Text, View,
} from 'react-native-ui-lib';
import { SettingsActionType, SettingsContext } from '../../../core/settings';
import { Configuration, ConfigurationMode } from '../../../core/settings/settings.interface';

const ConfigurationEditSimple = React.lazy(() => import('../containers/configurations/edit-simple'));
const ConfigurationEditAdvance = React.lazy(() => import('../containers/configurations/edit-advance'));

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

const ConfigurationEditScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { settings, settingsDispatcher } = React.useContext(SettingsContext);
  const configurationId = (route.params as { id?: string } | undefined)?.id;
  const savedConfiguration = React.useMemo(() => settings.configurations.find(
    (item) => item.id === configurationId,
  ), [settings.configurations, configurationId]);
  const [configuration, setConfiguration] = React.useState<Configuration | undefined>(savedConfiguration);
  React.useEffect(() => {
    setConfiguration(savedConfiguration);
  }, [savedConfiguration]);

  const hasChanges = configuration !== undefined && configuration !== savedConfiguration;

  const handleUpdate = (data: Configuration) => {
    settingsDispatcher({
      type: SettingsActionType.UPDATE_CONFIGURATION,
      value: data,
    });
    navigation.goBack();
  };

  const [actionsVisible, setActionVisible] = React.useState<boolean>(false);
  const actionsButtonProps = React.useMemo<ButtonProps>(() => (
    actionsVisible
      ? { ...actionsButtonDefault }
      : {
        iconSource: Assets.icons.barsClose,
        iconStyle: {
          width: 15,
          height: 15,
          margin: 8,
          tintColor: Colors.$iconDefaultLight,
        },
      }
  ), [actionsVisible]);

  return (
    <View bg-screenBG flex>
      <View
        row
        spread
        paddingV-10
        paddingH-10
        paddingB-5
        centerV
      >
        <View row centerV>
          <Text text60>{configuration?.name}</Text>
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
        <View padding-10 paddingT-0 center>
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
        {configuration?.mode === ConfigurationMode.SIMPLE && (
          <Suspense fallback={<LoaderScreen />}>
            <ConfigurationEditSimple
              configuration={configuration}
              onUpdate={setConfiguration}
            />
          </Suspense>
        )}
        {configuration?.mode === ConfigurationMode.ADVANCE && (
          <Suspense fallback={<LoaderScreen />}>
            <ConfigurationEditAdvance
              configuration={configuration}
              onUpdate={setConfiguration}
            />
          </Suspense>
        )}
      </View>
      <FloatingButton
        duration={500}
        visible={actionsVisible}
        button={{
          size: Button.sizes.large,
          disabled: !hasChanges,
          onPress: () => {
            if (configuration) {
              handleUpdate(configuration);
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
        secondaryButton={{
          size: Button.sizes.medium,
          label: 'Delete Configuration',
          onPress: () => {
            if (configuration?.id) {
              settingsDispatcher({
                type: SettingsActionType.DELETE_CONFIGURATIONS,
                value: [configuration?.id],
              });
            }
            setActionVisible(false);
          },
          backgroundColor: Colors.$backgroundDangerHeavy,
          link: false,
          animateLayout: true,
          iconSource: Assets.icons.trash,
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

export default ConfigurationEditScreen;
