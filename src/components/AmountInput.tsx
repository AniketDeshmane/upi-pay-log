import React from 'react';
import {View, TextInput, Text, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export function AmountInput({value, onChange}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.currency}>₹</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={colors.textDim}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 56,
  },
  currency: {
    fontSize: 22,
    color: colors.textSecondary,
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 28,
    color: colors.text,
    fontWeight: '600',
  },
});
