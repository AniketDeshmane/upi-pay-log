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

export function shareToWhatsApp(imagePath: string, message: string, phone: string): Promise<void> {
  return UpiApps.shareToWhatsApp(imagePath, message, phone);
}

export function launchApp(packageName: string): Promise<void> {
  return UpiApps.launchApp(packageName);
}

export function generateAndSaveQr(qrData: string): Promise<string> {
  return UpiApps.generateAndSaveQr(qrData);
}

export function bringAppToForeground(): Promise<void> {
  return UpiApps.bringAppToForeground();
}
