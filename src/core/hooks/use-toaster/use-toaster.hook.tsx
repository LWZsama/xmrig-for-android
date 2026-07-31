import React from 'react';
import { ToasterContext, ToasterContextProps } from './toaset.context';

export const useToaster = () => {
  const { addToast } = React.useContext<ToasterContextProps>(ToasterContext);

  return addToast;
};
