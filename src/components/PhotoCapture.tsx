import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Image} from 'react-native';
import {Camera, useCameraDevice, useCameraPermission} from 'react-native-vision-camera';
import {colors} from '../theme/colors';

interface Props {
  onPhoto: (uri: string) => void;
  onClose: () => void;
}

export function PhotoCapture({onPhoto, onClose}: Props) {
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  async function takePhoto() {
    if (camera.current) {
      const photo = await camera.current.takePhoto({
        flash: 'off',
      });
      setPhotoUri(`file://${photo.path}`);
    }
  }

  const {hasPermission, requestPermission} = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>No camera found</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{uri: photoUri}} style={StyleSheet.absoluteFill} />
        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => setPhotoUri(null)}>
            <Text style={styles.btnText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => onPhoto(photoUri)}>
            <Text style={styles.btnTextBlack}>Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
          <View style={styles.captureInner} />
        </TouchableOpacity>
        <View style={{width: 60}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background},
  error: {color: colors.error},
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 30,
    paddingBottom: 50,
  },
  cancelBtn: {padding: 10, width: 60},
  cancelText: {color: 'white', fontSize: 16},
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  previewControls: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {color: 'white', fontSize: 16, fontWeight: '600'},
  btnTextBlack: {color: '#000', fontSize: 16, fontWeight: '700'},
});
