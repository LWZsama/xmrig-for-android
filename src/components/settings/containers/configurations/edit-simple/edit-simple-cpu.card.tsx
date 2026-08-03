import React from 'react';
import {
  Card, Colors, Incubator, Switch, Text, View, RadioGroup, RadioButton, SkeletonView,
} from 'react-native-ui-lib';
import { StyleSheet } from 'react-native';
import { EditSimpleCardProps } from './index';
import {
  cpuValidator,
  maxThreadsHintValidator, priorityValidator,
} from '../../../../../core/utils/validators';
import {
  IConfiguratioPropertiesCPU, RandomXMode,
} from '../../../../../core/settings/settings.interface';
import { updateSimpleConfigurationProperties } from '../../../../../core/settings/update-configuration';

const EditSimpleCPUCardComponent: React.FC<EditSimpleCardProps> = (
  { setLocalState, localState },
) => {
  const cpu = localState.properties?.cpu;
  const valid = React.useMemo(
    () => cpuValidator.validate(cpu || {}).error == null,
    [cpu],
  );

  const [priority, setPriority] = React.useState<string>(cpu?.priority?.toString() || '');
  const [maxThreadsHint, setMaxThreadsHint] = React.useState<string>(
    cpu?.max_threads_hint?.toString() || '',
  );

  React.useEffect(() => {
    setPriority(cpu?.priority?.toString() || '');
    setMaxThreadsHint(cpu?.max_threads_hint?.toString() || '');
  }, [cpu]);

  const updateCPU = React.useCallback((changes: Partial<IConfiguratioPropertiesCPU>) => {
    setLocalState((oldState) => updateSimpleConfigurationProperties(oldState, {
      cpu: { ...oldState.properties?.cpu, ...changes },
    }));
  }, [setLocalState]);

  return (
    <Card
      enableShadow={false}
      selected={!valid}
      selectionOptions={{
        hideIndicator: true,
        color: Colors.$outlineDanger,
      }}
    >
      <View centerV spread padding-20 paddingB-5>
        <Card.Section
          style={{ flexShrink: 1 }}
          content={[
            { text: 'CPU', text65: true, $textDefault: true },
          ]}
        />
      </View>
      <View spread padding-20 paddingT-10>
        <View marginB-10>
          <View row flex>
            <Text text80 $textNeutralLight flex column marginB-5>Yield</Text>
            <Switch
              value={localState.properties?.cpu?.yield}
              onValueChange={(value) => setLocalState(
                (oldState) => updateSimpleConfigurationProperties(
                  oldState,
                  { cpu: { ...oldState.properties?.cpu, yield: value } },
                ),
              )}
            />
          </View>
          <Text text100 $textNeutralLight row>
            Maximum hashrate `OFF` (optimized default); turn `ON` only when
            interactive system response is more important.
          </Text>
        </View>
        <View flex paddingT-10>
          <View marginB-10>
            <Text text80 $textNeutralLight flex row marginB-2>RandomX Mode</Text>
            <RadioGroup
              onValueChange={(value: RandomXMode) => setLocalState(
                (oldState) => updateSimpleConfigurationProperties(
                  oldState,
                  { cpu: { ...oldState.properties?.cpu, random_x_mode: value } },
                ),
              )}
              initialValue={localState.properties?.cpu?.random_x_mode}
              marginB-5
            >
              <View row spread>
                <RadioButton label="Auto" value={RandomXMode.AUTO} />
                <RadioButton label="Fast" value={RandomXMode.FAST} />
                <RadioButton label="Light" value={RandomXMode.LIGHT} />
              </View>
            </RadioGroup>
            <Text text100 $textNeutralLight row>
              RandomX mining mode: "auto", "fast" (2 GB memory),
              "light" (256 MB memory).
            </Text>
          </View>
        </View>
        <View flex paddingT-10>
          <Incubator.TextField
            placeholder="Priority"
            floatingPlaceholder
            value={priority}
            onChangeText={setPriority}
            onBlur={() => updateCPU({ priority: priority as unknown as number })}
            validate={
              (value: string) => priorityValidator
                .validate(value)
                .error == null
            }
            validationMessage={
              priorityValidator
                .validate(priority)
                .error?.message
            }
            validateOnChange={false}
            enableErrors
            floatOnFocus
            showCharCounter
            maxLength={128}
            fieldStyle={styles.withUnderline}
            hint="1 - 5"
            keyboardType="numeric"
          />
          <Text text100 $textNeutralLight row>
            Threads priority, from 1 (lowest) to 5 (highest).
            Optimized default: 2 (normal priority).
          </Text>
        </View>
        <View flex paddingT-10>
          <Incubator.TextField
            placeholder="Max Threads Hint"
            floatingPlaceholder
            value={maxThreadsHint}
            onChangeText={setMaxThreadsHint}
            onBlur={() => updateCPU({ max_threads_hint: maxThreadsHint as unknown as number })}
            validate={
              (value: string) => maxThreadsHintValidator
                .validate(value)
                .error == null
            }
            validationMessage={
              maxThreadsHintValidator
                .validate(maxThreadsHint)
                .error?.message
            }
            validateOnChange={false}
            enableErrors
            floatOnFocus
            showCharCounter
            maxLength={3}
            fieldStyle={styles.withUnderline}
            hint="50"
            keyboardType="numeric"
            trailingAccessory={<Text>% of device cores</Text>}
          />
          <Text text100 $textNeutralLight row>
            For 1 core CPU this option has no effect,
            for 2 core CPU only 2 values possible 50% and 100%,
            for 4 cores: 25%, 50%, 75%, 100%. etc.
            On ARM, XMRig also receives an automatic thread affinity profile
            when the device exposes big.LITTLE topology information.
          </Text>
        </View>
      </View>
    </Card>
  );
};

export const EditSimpleCPUCard = React.memo(
  EditSimpleCPUCardComponent,
  (previous, next) => previous.localState.properties?.cpu === next.localState.properties?.cpu,
);

const styles = StyleSheet.create({
  withUnderline: {
    borderBottomWidth: 1,
    borderColor: Colors.$outlineDisabled,
    paddingBottom: 4,
  },
});

const EditSimpleCPUCardSkeleton: React.FC<EditSimpleCardProps> = (props) => {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  React.useEffect(() => {
    const interval = setTimeout(() => setLoaded(true), 800);
    return () => {
      clearTimeout(interval);
      setLoaded(false);
    };
  }, []);

  return (
    <SkeletonView
      template={SkeletonView.templates.TEXT_CONTENT}
      customValue={props}
      showContent={loaded}
      renderContent={
        // eslint-disable-next-line react/jsx-props-no-spreading
        (customProps: EditSimpleCardProps) => (<EditSimpleCPUCard {...customProps} />)
      }
      times={3}
    />
  );
};

export default EditSimpleCPUCardSkeleton;
