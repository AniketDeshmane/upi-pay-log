import React, {useEffect} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {colors} from '../theme/colors';

interface Props {
  onScan: (value: string) => void;
  onClose: () => void;
}

export function QrScanner({onScan, onClose}: Props) {
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0].value) {
        onScan(codes[0].value);
        onClose();
      }
    },
  });

  useEffect(() => {
    Camera.requestCameraPermission();
  }, []);

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>No camera found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Point at a UPI QR code</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background},
  error: {color: colors.error},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
  },
  hint: {
    color: colors.white,
    marginTop: 20,
    fontSize: 15,
  },
});
