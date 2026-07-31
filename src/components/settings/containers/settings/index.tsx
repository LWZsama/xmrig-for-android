import { ViewProps } from 'react-native-ui-lib';

export type SettingsCardProps<T> = ViewProps & {
  powerSettings: T;
  onUpdate: (data: Partial<T>) => void;
};
