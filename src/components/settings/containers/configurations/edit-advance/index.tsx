import React from 'react';
import { IAdvanceConfiguration } from '../../../../../core/settings/settings.interface';

export type EditAdvanceCardProps = {
  setLocalState: React.Dispatch<React.SetStateAction<IAdvanceConfiguration>>;
  localState: IAdvanceConfiguration;
};

export { EditAdvanceEditorCard } from './edit-advance-editor.card';
