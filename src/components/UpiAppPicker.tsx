import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {colors} from '../theme/colors';
import type {UpiApp} from '../native/UpiApps';

interface Props {
  apps: UpiApp[];
  loading: boolean;
  selected: string;
  onSelect: (pkg: string) => void;
}

export function UpiAppPicker({apps, loading, selected, onSelect}: Props) {
  if (loading) {
    return <ActivityIndicator color={colors.primary} style={{marginVertical: 24}} />;
  }

  const options: Array<{packageName: string; appName: string; iconBase64?: string}> = [
    {packageName: 'ask', appName: 'Ask every time'},
    ...apps,
  ];

  return (
    <FlatList
      data={options}
      keyExtractor={item => item.packageName}
      scrollEnabled={false}
      renderItem={({item}) => {
        const isSelected = selected === item.packageName;
        return (
          <TouchableOpacity
            style={[styles.row, isSelected && styles.rowSelected]}
            onPress={() => onSelect(item.packageName)}>
            {item.iconBase64 ? (
              <Image
                source={{uri: `data:image/png;base64,${item.iconBase64}`}}
                style={styles.icon}
              />
            ) : (
              <View style={styles.iconPlaceholder} />
            )}
            <Text style={styles.label}>{item.appName}</Text>
            {isSelected && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowSelected: {
    borderColor: colors.primary,
  },
  icon: {width: 36, height: 36, borderRadius: 8, marginRight: 12},
  iconPlaceholder: {width: 36, height: 36, borderRadius: 8, marginRight: 12, backgroundColor: colors.border},
  label: {flex: 1, color: colors.text, fontSize: 16},
  check: {color: colors.primary, fontSize: 18, fontWeight: 'bold'},
});
