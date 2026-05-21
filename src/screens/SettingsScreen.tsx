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
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../theme/colors';
import {UpiAppPicker} from '../components/UpiAppPicker';
import {getInstalledUpiApps, type UpiApp} from '../native/UpiApps';
import {
  getDefaultUpiPackage,
  getWhatsAppNumber,
  setDefaultUpiPackage,
  setWhatsAppNumber,
} from '../storage/storage';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({navigation}: Props) {
  const [apps, setApps] = useState<UpiApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState('ask');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    Promise.all([
      getInstalledUpiApps().then(setApps).catch(() => setApps([])),
      getDefaultUpiPackage().then(setSelectedPkg),
      getWhatsAppNumber().then(setPhone),
    ]).finally(() => setLoading(false));
  }, []);

  async function save() {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      Alert.alert('Invalid number', 'Enter your WhatsApp number with country code.');
      return;
    }
    await setDefaultUpiPackage(selectedPkg);
    await setWhatsAppNumber(cleaned);
    Alert.alert('Saved', 'Settings updated.', [{text: 'OK', onPress: () => navigation.goBack()}]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>Default UPI App</Text>
        <UpiAppPicker
          apps={apps}
          loading={loading}
          selected={selectedPkg}
          onSelect={setSelectedPkg}
        />

        <Text style={styles.section}>WhatsApp Number</Text>
        <Text style={styles.hint}>With country code, no + sign (e.g. 919876543210)</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="919876543210"
          placeholderTextColor={colors.textDim}
          maxLength={15}
        />

        <TouchableOpacity style={styles.btn} onPress={save}>
          <Text style={styles.btnText}>Save Settings</Text>
        </TouchableOpacity>

        <View style={styles.about}>
          <Text style={styles.aboutText}>UPI Pay Log v1.0</Text>
          <Text style={styles.aboutSubtext}>Minimal. Local. Private.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: 20},
  section: {fontSize: 15, fontWeight: '700', color: colors.textSecondary, marginTop: 24, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8},
  hint: {fontSize: 12, color: colors.textDim, marginBottom: 10},
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 17,
    color: colors.text,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  btnText: {fontSize: 16, fontWeight: '700', color: '#000'},
  about: {alignItems: 'center', marginTop: 48},
  aboutText: {fontSize: 14, color: colors.textDim},
  aboutSubtext: {fontSize: 12, color: colors.textDim, marginTop: 4},
});
