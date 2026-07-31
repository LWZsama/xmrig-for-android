import React, { Suspense } from 'react';
import {
  ScrollView,
} from 'react-native';
import {
  LoaderScreen,
  View, ViewProps,
} from 'react-native-ui-lib';
import {
  ISimpleConfiguration,
} from '../../../../core/settings/settings.interface';

const EditSimpleForkCard = React.lazy(() => import('./edit-simple/edit-simple-fork.card'));
const EditSimplePoolCard = React.lazy(() => import('./edit-simple/edit-simple-pool.card'));
const EditSimpleCPUCard = React.lazy(() => import('./edit-simple/edit-simple-cpu.card'));
const EditSimpleAlgorithemsCard = React.lazy(() => import('./edit-simple/edit-simple-algorithems.card'));

type ConfigurationEditSimpleProps = ViewProps & {
    configuration: ISimpleConfiguration;
    onUpdate: (configurationData: ISimpleConfiguration) => void;
};

export const ConfigurationEditSimple:React.FC<ConfigurationEditSimpleProps> = ({
  configuration,
  onUpdate,
}) => {
  const [localState, setLocalState] = React.useState<ISimpleConfiguration>(configuration);

  React.useEffect(() => {
    onUpdate(localState);
  }, [localState]);

  return (
    <Suspense fallback={<LoaderScreen />}>
      <ScrollView nestedScrollEnabled>
        <EditSimpleForkCard localState={localState} setLocalState={setLocalState} />
        <View height={10} />
        <EditSimplePoolCard localState={localState} setLocalState={setLocalState} />
        <View height={10} />
        <EditSimpleCPUCard localState={localState} setLocalState={setLocalState} />
        <View height={10} />
        <EditSimpleAlgorithemsCard localState={localState} setLocalState={setLocalState} />
      </ScrollView>
    </Suspense>
  );
};

export default ConfigurationEditSimple;
