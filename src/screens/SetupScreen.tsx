import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {colors} from '../theme/colors';
import {UpiAppPicker} from '../components/UpiAppPicker';
import {getInstalledUpiApps, type UpiApp} from '../native/UpiApps';
import {markSetupComplete, setDefaultUpiPackage, setWhatsAppNumber} from '../storage/storage';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Setup'>;

export function SetupScreen({navigation}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [apps, setApps] = useState<UpiApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState('ask');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    getInstalledUpiApps()
      .then(setApps)
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  async function finish() {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      Alert.alert('Invalid number', 'Enter your WhatsApp number with country code, e.g. 919876543210');
      return;
    }
    await setDefaultUpiPackage(selectedPkg);
    await setWhatsAppNumber(cleaned);
    await markSetupComplete();
    navigation.replace('Main');
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Welcome to UPI Pay Log</Text>
      {step === 1 ? (
        <>
          <Text style={styles.subtitle}>Choose your default UPI app</Text>
          <UpiAppPicker
            apps={apps}
            loading={loading}
            selected={selectedPkg}
            onSelect={setSelectedPkg}
          />
          <TouchableOpacity style={styles.btn} onPress={() => setStep(2)}>
            <Text style={styles.btnText}>Next</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>WhatsApp number for payment alerts</Text>
          <Text style={styles.hint}>Include country code, no + sign{'\n'}e.g. 919876543210</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="919876543210"
            placeholderTextColor={colors.textDim}
            maxLength={15}
          />
          <TouchableOpacity style={styles.btn} onPress={finish}>
            <Text style={styles.btnText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1, backgroundColor: colors.background},
  content: {padding: 24, paddingTop: 60},
  title: {fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 8},
  subtitle: {fontSize: 16, color: colors.textSecondary, marginBottom: 20, marginTop: 24},
  hint: {fontSize: 13, color: colors.textDim, marginBottom: 12, lineHeight: 20},
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: {fontSize: 16, fontWeight: '700', color: '#000'},
  backBtn: {alignItems: 'center', marginTop: 16},
  backBtnText: {color: colors.textSecondary, fontSize: 15},
});
