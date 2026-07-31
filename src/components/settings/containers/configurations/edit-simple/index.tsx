import React from 'react';
import { ISimpleConfiguration } from '../../../../../core/settings/settings.interface';

export type EditSimpleCardProps = {
  setLocalState: React.Dispatch<React.SetStateAction<ISimpleConfiguration>>;
  localState: ISimpleConfiguration;
};

export { EditSimpleForkCard } from './edit-simple-fork.card';

export { EditSimplePoolCard } from './edit-simple-pool.card';

export { EditSimpleCPUCard } from './edit-simple-cpu.card';
