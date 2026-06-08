import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
  StyleSheet,
  Image,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {colors} from '../theme/colors';
import {QrScanner} from '../components/QrScanner';
import {PhotoCapture} from '../components/PhotoCapture';
import {AmountInput} from '../components/AmountInput';
import {parseUpiQr, buildUpiUrl, buildWhatsAppUrl} from '../utils/upi';
import {launchUpiIntent, getInstalledUpiApps, shareToWhatsApp, generateAndSaveQr, launchApp, bringAppToForeground} from '../native/UpiApps';
import {
  getDefaultUpiPackage,
  getWhatsAppNumber,
  saveTransaction,
  getAskEveryTime,
  getPhotoMode,
} from '../storage/storage';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

let hasPerformedPreAuth = false;

export function MainScreen({navigation}: Props) {
  const [scanning, setScanning] = useState(false);
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const [photoMode, setPhotoModeState] = useState<'off' | 'optional' | 'required'>('off');
  const [vpa, setVpa] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [rawQr, setRawQr] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasPerformedPreAuth) {
      hasPerformedPreAuth = true;
      getDefaultUpiPackage().then(pkg => {
        if (pkg && pkg !== 'ask') {
          launchApp(pkg).then(() => {
            setTimeout(() => bringAppToForeground(), 2500);
          }).catch(() => {});
        }
      });
    }

    // Auto-open scanner on mount
    const timer = setTimeout(() => setScanning(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getPhotoMode().then(setPhotoModeState);
    }, [])
  );

  function handleQrScan(raw: string) {
    const parsed = parseUpiQr(raw);
    if (!parsed) {
      Alert.alert('Invalid QR', 'This does not appear to be a UPI QR code.');
      return;
    }
    setVpa(parsed.vpa);
    setPayeeName(parsed.payeeName);
    setRawQr(raw);
  }

  async function handlePay() {
    if (!vpa || !rawQr) {
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
      comment,
    };
    await saveTransaction(tx);

    let upiUrl = rawQr;
    if (upiUrl.includes('&am=')) {
      upiUrl = upiUrl.replace(/&am=[^&]+/, `&am=${amount}`);
    } else {
      upiUrl += `&am=${amount}`;
    }

    try {
      await generateAndSaveQr(upiUrl);
    } catch (e: any) {
      Alert.alert('QR Generation Failed', e.message || 'Could not generate QR code image.');
      return;
    }

    const askEveryTime = await getAskEveryTime();
    const pkg = await getDefaultUpiPackage();

    try {
      if (!askEveryTime && pkg !== 'ask') {
        await launchApp(pkg);
        setTimeout(() => {
          Alert.alert('QR Code Ready', 'A crisp digital QR code has been saved to your gallery. Please use the "Scan any QR" -> "Gallery" option in your UPI app to select it.');
        }, 1000);
      } else {
        Alert.alert(
          'Default App Required',
          'A default UPI App must be selected in Settings to use the Gallery QR scan workaround.'
        );
        return;
      }
    } catch {
      Alert.alert('Could not open UPI app', 'Make sure the default UPI app is installed.');
    }

    const phone = await getWhatsAppNumber();
    if (phone) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        if (photoUri) {
          const now = new Date();
          const dateStr = now.toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'});
          const timeStr = now.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit', hour12: false});
          const message = `\u{1F4B8} \u20B9${amount} to ${payeeName}\n\u{1F4C5} ${dateStr}, ${timeStr}\n\u{1F3F7}\uFE0F ${vpa}${comment ? `\n\u{1F4DD} ${comment}` : ''}`;
          
          try {
            await shareToWhatsApp(photoUri, message, phone);
            setTimeout(() => bringAppToForeground(), 3000);
          } catch {
            // fallback if something fails
          }
        } else {
          const waUrl = buildWhatsAppUrl(phone, payeeName, vpa, amount) + (comment ? `\n\u{1F4DD} ${comment}` : '');
          try {
            await Linking.openURL(waUrl);
            setTimeout(() => bringAppToForeground(), 3000);
          } catch {
            /* WhatsApp not installed */
          }
        }
      }, 10000);
    }

    setVpa('');
    setPayeeName('');
    setAmount('');
    setComment('');
    setRawQr('');
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

        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment (optional)"
          placeholderTextColor={colors.textSecondary}
          value={comment}
          onChangeText={setComment}
          multiline
        />

        {photoMode !== 'off' && vpa !== '' && amount !== '' && !photoUri && (
          <TouchableOpacity style={styles.photoBtn} onPress={() => setCapturingPhoto(true)}>
            <Text style={styles.photoBtnIcon}>📸</Text>
            <Text style={styles.photoBtnText}>
              Take Photo {photoMode === 'required' ? '(Required)' : '(Optional)'}
            </Text>
          </TouchableOpacity>
        )}

        {photoUri && (
          <View style={styles.photoPreviewRow}>
            <Image source={{uri: photoUri}} style={styles.photoThumbnail} />
            <TouchableOpacity style={styles.retakeBtn} onPress={() => setCapturingPhoto(true)}>
              <Text style={styles.retakeBtnText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.payBtn,
            (!vpa || !amount || (photoMode === 'required' && !photoUri)) && styles.payBtnDisabled
          ]}
          onPress={handlePay}
          disabled={!vpa || !amount || (photoMode === 'required' && !photoUri)}>
          <Text style={styles.payBtnText}>Pay</Text>
        </TouchableOpacity>

        {vpa ? (
          <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanning(true)}>
            <Text style={styles.rescanBtnText}>Rescan QR</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Modal visible={scanning} animationType="slide" onRequestClose={() => setScanning(false)}>
        {scanning && (
          <>
            <QrScanner onScan={handleQrScan} onClose={() => setScanning(false)} />
            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setScanning(false)}>
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </Modal>

      <Modal visible={capturingPhoto} animationType="slide" onRequestClose={() => setCapturingPhoto(false)}>
        {capturingPhoto && (
          <PhotoCapture
            onPhoto={(uri) => {
              setPhotoUri(uri);
              setCapturingPhoto(false);
            }}
            onClose={() => setCapturingPhoto(false)}
          />
        )}
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
  amountContainer: {marginBottom: 16},
  commentInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    minHeight: 80,
    textAlignVertical: 'top',
  },
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  closeModalText: {color: 'white', fontSize: 16, fontWeight: '600'},
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoBtnIcon: {fontSize: 20, marginRight: 8},
  photoBtnText: {color: colors.textSecondary, fontSize: 16, fontWeight: '600'},
  photoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoThumbnail: {width: 60, height: 60, borderRadius: 8, marginRight: 16},
  retakeBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retakeBtnText: {color: colors.textSecondary, fontSize: 14, fontWeight: '600'},
});
