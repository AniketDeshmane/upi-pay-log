import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
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
  getAskEveryTime,
  setAskEveryTime,
  getPhotoMode,
  setPhotoMode,
} from '../storage/storage';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({navigation}: Props) {
  const [apps, setApps] = useState<UpiApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState('ask');
  const [phone, setPhone] = useState('');
  const [askEveryTime, setAskEveryTimeState] = useState(true);
  const [photoMode, setPhotoModeState] = useState<'off' | 'optional' | 'required'>('off');

  useEffect(() => {
    Promise.all([
      getInstalledUpiApps().then(setApps).catch(() => setApps([])),
      getDefaultUpiPackage().then(setSelectedPkg),
      getWhatsAppNumber().then(setPhone),
      getAskEveryTime().then(setAskEveryTimeState),
      getPhotoMode().then(setPhotoModeState),
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
    await setAskEveryTime(askEveryTime);
    await setPhotoMode(photoMode);
    Alert.alert('Saved', 'Settings updated.', [{text: 'OK', onPress: () => navigation.goBack()}]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.switchRow}>
          <Text style={styles.sectionNoMargin}>Ask every time to choose UPI App</Text>
          <Switch
            value={askEveryTime}
            onValueChange={setAskEveryTimeState}
            trackColor={{false: colors.surfaceElevated, true: colors.primaryDim}}
            thumbColor={askEveryTime ? colors.primary : colors.textDim}
          />
        </View>

        {!askEveryTime && (
          <>
            <Text style={styles.section}>Dedicated UPI App</Text>
            <UpiAppPicker
              apps={apps}
              loading={loading}
              selected={selectedPkg}
              onSelect={setSelectedPkg}
            />
          </>
        )}

        <Text style={styles.section}>Item Photo (for WhatsApp)</Text>
        <View style={styles.modeRow}>
          {(['off', 'optional', 'required'] as const).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[styles.modeBtn, photoMode === mode && styles.modeBtnActive]}
              onPress={() => setPhotoModeState(mode)}>
              <Text style={[styles.modeText, photoMode === mode && styles.modeTextActive]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
  switchRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12},
  sectionNoMargin: {fontSize: 15, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8},
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
  modeRow: {flexDirection: 'row', gap: 8, marginBottom: 12},
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  modeBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim + '40',
  },
  modeText: {color: colors.textSecondary, fontWeight: '600'},
  modeTextActive: {color: colors.primary},
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
