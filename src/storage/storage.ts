import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  timestamp: number;
  payeeName: string;
  vpa: string;
  amount: string;
  photoUri?: string;
}

const KEYS = {
  SETUP_COMPLETE: 'setup_complete',
  DEFAULT_UPI_PACKAGE: 'default_upi_package',
  WHATSAPP_NUMBER: 'whatsapp_number',
  TRANSACTIONS: 'transactions',
} as const;

export async function isSetupComplete(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.SETUP_COMPLETE);
  return val === 'true';
}

export async function markSetupComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETUP_COMPLETE, 'true');
}

export async function getDefaultUpiPackage(): Promise<string> {
  return (await AsyncStorage.getItem(KEYS.DEFAULT_UPI_PACKAGE)) ?? 'ask';
}

export async function setDefaultUpiPackage(pkg: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.DEFAULT_UPI_PACKAGE, pkg);
}

export async function getWhatsAppNumber(): Promise<string> {
  return (await AsyncStorage.getItem(KEYS.WHATSAPP_NUMBER)) ?? '';
}

export async function setWhatsAppNumber(number: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.WHATSAPP_NUMBER, number);
}

export async function getTransactions(): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

export async function saveTransaction(tx: Transaction): Promise<void> {
  const existing = await getTransactions();
  const updated = [tx, ...existing];
  await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(updated));
}
