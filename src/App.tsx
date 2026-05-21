import React, {useEffect, useState} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {RootNavigator} from './navigation/RootNavigator';
import {isSetupComplete} from './storage/storage';
import {colors} from './theme/colors';

export default function App() {
  const [ready, setReady] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  useEffect(() => {
    isSetupComplete().then(done => {
      setSetupDone(done);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <RootNavigator initialRoute={setupDone ? 'Main' : 'Setup'} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
