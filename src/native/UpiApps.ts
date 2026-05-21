import {NativeModules} from 'react-native';

export interface UpiApp {
  packageName: string;
  appName: string;
  iconBase64: string;
}

const {UpiApps} = NativeModules;

export function getInstalledUpiApps(): Promise<UpiApp[]> {
  return UpiApps.getInstalledUpiApps();
}

export function launchUpiIntent(packageName: string, url: string): Promise<void> {
  return UpiApps.launchUpiIntent(packageName, url);
}
