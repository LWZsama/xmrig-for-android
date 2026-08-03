import React from 'react';
import {
  Button,
  Card, Colors, Incubator, SkeletonView, Switch, Text, View,
} from 'react-native-ui-lib';
import { StyleSheet } from 'react-native';
import { EditSimpleCardProps } from './index';
import {
  hostnameValidator, passwordValidator, poolValidator, portValidator, usernameValidator,
} from '../../../../../core/utils/validators';
import { IConfiguratioPropertiesPool } from '../../../../../core/settings/settings.interface';
import { updateSimpleConfigurationProperties } from '../../../../../core/settings/update-configuration';
import PoolListModal from '../../../modals/pool-list.modal';

const EditSimplePoolCardComponent: React.FC<EditSimpleCardProps> = (
  { setLocalState, localState },
) => {
  const pool = localState.properties?.pool;
  const valid = React.useMemo(
    () => poolValidator.validate(pool || {}).error == null,
    [pool],
  );

  const [hostname, setHostname] = React.useState<string>(pool?.hostname || '');
  const [port, setPort] = React.useState<string>(pool?.port?.toString() || '');
  const [username, setUsername] = React.useState<string>(pool?.username || '');
  const [password, setPassword] = React.useState<string>(pool?.password || '');
  const [showPoolListDialog, setShowPoolListDialog] = React.useState<boolean>(false);

  React.useEffect(() => {
    setHostname(pool?.hostname || '');
    setPort(pool?.port?.toString() || '');
    setUsername(pool?.username || '');
    setPassword(pool?.password || '');
  }, [pool]);

  const updatePool = React.useCallback((changes: Partial<IConfiguratioPropertiesPool>) => {
    setLocalState((oldState) => updateSimpleConfigurationProperties(oldState, {
      pool: { ...oldState.properties?.pool, ...changes },
    }));
  }, [setLocalState]);

  return (
    <>
      <PoolListModal
        onAdd={(pool: IConfiguratioPropertiesPool) => {
          setLocalState((oldState) => updateSimpleConfigurationProperties(oldState, { pool }));
        }}
        onDismiss={() => setShowPoolListDialog(false)}
        visible={showPoolListDialog}
      />
      <Card
        enableShadow={false}
        selected={!valid}
        selectionOptions={{
          hideIndicator: true,
          color: Colors.$outlineDanger,
        }}
      >
        <View centerV spread padding-20 paddingB-5>
          <View row centerV>
            <Card.Section
              style={{ flexShrink: 1 }}
              content={[
                { text: 'Pool', text65: true, $textDefault: true },
                { text: 'Pools connection details provided by the pool. We provide presets for some popular pools.', text90: true, $textNeutral: true },
              ]}
            />
            <View paddingL-10>
              <Button size={Button.sizes.small} label="Presets" onPress={() => setShowPoolListDialog(true)} />
            </View>
          </View>
        </View>
        <View spread padding-20 paddingT-10>
          <View flex row>
            <View flex-2 marginR-20>
              <Incubator.TextField
                placeholder="Hostname / IP"
                floatingPlaceholder
                value={hostname}
                onChangeText={setHostname}
                onBlur={() => updatePool({ hostname })}
                validate={
                  (value: string) => hostnameValidator
                    .validate(value)
                    .error == null
                }
                validationMessage={
                  hostnameValidator
                    .validate(hostname)
                    .error?.message
                }
                validateOnChange={false}
                enableErrors
                floatOnFocus
                showCharCounter
                maxLength={128}
                fieldStyle={styles.withUnderline}
                hint="pool.domain.tld"
                keyboardType="url"
              />
            </View>
            <View flex-1>
              <Incubator.TextField
                placeholder="Port"
                floatingPlaceholder
                value={port}
                onChangeText={setPort}
                onBlur={() => updatePool({ port: port as unknown as number })}
                validate={
                  (value: string) => portValidator
                    .validate(value)
                    .error == null
                }
                validationMessage={
                  portValidator
                    .validate(port)
                    .error?.message
                }
                validateOnChange={false}
                enableErrors
                floatOnFocus
                showCharCounter
                maxLength={5}
                fieldStyle={styles.withUnderline}
                hint="80"
                keyboardType="numeric"
              />
            </View>
          </View>
          <Incubator.TextField
            placeholder="Username"
            floatingPlaceholder
            value={username}
            onChangeText={setUsername}
            onBlur={() => updatePool({ username })}
            validate={
              (value: string) => usernameValidator
                .validate(value)
                .error == null
            }
            validationMessage={
              usernameValidator
                .validate(username)
                .error?.message
            }
            validateOnChange={false}
            enableErrors
            floatOnFocus
            showCharCounter
            maxLength={128}
            fieldStyle={styles.withUnderline}
            hint="Mostly used for wallet"
          />
          <Incubator.TextField
            placeholder="Password"
            floatingPlaceholder
            value={password}
            onChangeText={setPassword}
            onBlur={() => updatePool({ password })}
            validate={
              (value: string) => passwordValidator
                .validate(value)
                .error == null
            }
            validationMessage={
              passwordValidator
                .validate(password)
                .error?.message
            }
            validateOnChange={false}
            enableErrors
            floatOnFocus
            showCharCounter
            maxLength={128}
            fieldStyle={styles.withUnderline}
          />
          <View row flex paddingT-20>
            <Text text80 $textNeutralLight flex column>SSL</Text>
            <Switch
              value={localState.properties?.pool?.sslEnabled}
              onValueChange={(value) => setLocalState((oldState) => updateSimpleConfigurationProperties(
                oldState,
                { pool: { ...oldState.properties?.pool, sslEnabled: value } },
              ))}
            />
          </View>
        </View>
      </Card>
    </>
  );
};

export const EditSimplePoolCard = React.memo(
  EditSimplePoolCardComponent,
  (previous, next) => previous.localState.properties?.pool === next.localState.properties?.pool,
);

const styles = StyleSheet.create({
  withUnderline: {
    borderBottomWidth: 1,
    borderColor: Colors.$outlineDisabled,
    paddingBottom: 4,
  },
});

const EditSimplePoolCardSkeleton: React.FC<EditSimpleCardProps> = (props) => {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  React.useEffect(() => {
    const interval = setTimeout(() => setLoaded(true), 500);
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
        (customProps: EditSimpleCardProps) => (<EditSimplePoolCard {...customProps} />)
      }
      times={3}
    />
  );
};

export default EditSimplePoolCardSkeleton;
