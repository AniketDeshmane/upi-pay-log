import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
  StyleSheet,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../theme/colors';
import {QrScanner} from '../components/QrScanner';
import {AmountInput} from '../components/AmountInput';
import {parseUpiQr, buildUpiUrl, buildWhatsAppUrl} from '../utils/upi';
import {launchUpiIntent, getInstalledUpiApps} from '../native/UpiApps';
import {
  getDefaultUpiPackage,
  getWhatsAppNumber,
  saveTransaction,
} from '../storage/storage';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export function MainScreen({navigation}: Props) {
  const [scanning, setScanning] = useState(false);
  const [vpa, setVpa] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [amount, setAmount] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleQrScan(raw: string) {
    const parsed = parseUpiQr(raw);
    if (!parsed) {
      Alert.alert('Invalid QR', 'This does not appear to be a UPI QR code.');
      return;
    }
    setVpa(parsed.vpa);
    setPayeeName(parsed.payeeName);
  }

  async function handlePay() {
    if (!vpa) {
      Alert.alert('Scan QR first', 'Please scan a UPI QR code before paying.');
      return;
    }
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      Alert.alert('Enter amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    const tx = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      payeeName,
      vpa,
      amount,
      photoUri,
    };
    await saveTransaction(tx);

    const upiUrl = buildUpiUrl(vpa, payeeName, amount);
    const pkg = await getDefaultUpiPackage();

    try {
      if (pkg !== 'ask') {
        await launchUpiIntent(pkg, upiUrl);
      } else {
        await Linking.openURL(upiUrl);
      }
    } catch {
      Alert.alert('Could not open UPI app', 'Make sure a UPI app is installed.');
    }

    const phone = await getWhatsAppNumber();
    if (phone) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        const waUrl = buildWhatsAppUrl(phone, payeeName, vpa, amount);
        try {
          await Linking.openURL(waUrl);
        } catch {
          /* WhatsApp not installed */
        }
      }, 10000);
    }

    setVpa('');
    setPayeeName('');
    setAmount('');
    setPhotoUri(undefined);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>UPI Pay Log</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('History')}
            style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>🕒</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        {vpa ? (
          <View style={styles.qrResult}>
            <Text style={styles.payeeName}>{payeeName || 'Unknown'}</Text>
            <Text style={styles.vpa}>{vpa}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => setScanning(true)}>
            <Text style={styles.scanBtnIcon}>📷</Text>
            <Text style={styles.scanBtnText}>Scan QR</Text>
          </TouchableOpacity>
        )}

        <View style={styles.amountContainer}>
          <AmountInput value={amount} onChange={setAmount} />
        </View>

        <TouchableOpacity
          style={[styles.payBtn, (!vpa || !amount) && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={!vpa || !amount}>
          <Text style={styles.payBtnText}>Pay</Text>
        </TouchableOpacity>

        {vpa && (
          <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanning(true)}>
            <Text style={styles.rescanBtnText}>Rescan QR</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={scanning} animationType="slide" onRequestClose={() => setScanning(false)}>
        <QrScanner onScan={handleQrScan} onClose={() => setScanning(false)} />
        <TouchableOpacity
          style={styles.closeModal}
          onPress={() => setScanning(false)}>
          <Text style={styles.closeModalText}>Cancel</Text>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {fontSize: 18, fontWeight: '700', color: colors.text},
  headerActions: {flexDirection: 'row', gap: 8},
  headerBtn: {padding: 8},
  headerBtnText: {fontSize: 20},
  body: {flex: 1, padding: 24, justifyContent: 'center'},
  qrResult: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  payeeName: {fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 4},
  vpa: {fontSize: 13, color: colors.textSecondary},
  scanBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: 40,
    marginBottom: 24,
  },
  scanBtnIcon: {fontSize: 40, marginBottom: 10},
  scanBtnText: {fontSize: 16, color: colors.textSecondary, fontWeight: '600'},
  amountContainer: {marginBottom: 24},
  payBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  payBtnDisabled: {opacity: 0.4},
  payBtnText: {fontSize: 18, fontWeight: '700', color: '#000'},
  rescanBtn: {alignItems: 'center', marginTop: 16},
  rescanBtnText: {color: colors.textSecondary, fontSize: 14},
  closeModal: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 50,
  },
  closeModalText: {color: colors.white, fontSize: 16},
});
