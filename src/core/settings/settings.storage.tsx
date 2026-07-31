import AsyncStorage from '@react-native-async-storage/async-storage';
import { ISettings } from './settings.interface';

export const SettingsStorageInit = async (initalState:ISettings):Promise<ISettings> => {
  try {
    const jsonValue:string | null = await AsyncStorage.getItem('settings');
    if (jsonValue) {
      return {
        ...initalState,
        ...JSON.parse(jsonValue),
      };
    }
  } catch (e) {
    console.error(e);
  }
  return initalState;
};

export const SettingsStorageSave = async (settings:ISettings) => {
  try {
    const jsonValue:string = JSON.stringify(settings);
    await AsyncStorage.setItem('settings', jsonValue);
  } catch (e) {
    console.error(e);
  }
};
