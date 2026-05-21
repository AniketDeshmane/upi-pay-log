import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../theme/colors';
import {getTransactions, type Transaction} from '../storage/storage';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export function HistoryScreen({navigation}: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    getTransactions().then(setTransactions);
  }, []);

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>Payments you make will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.payeeName}>{item.payeeName || 'Unknown'}</Text>
                <Text style={styles.amount}>₹{item.amount}</Text>
              </View>
              <Text style={styles.vpa}>{item.vpa}</Text>
              <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  backBtn: {padding: 4},
  backBtnText: {color: colors.primary, fontSize: 16},
  headerTitle: {fontSize: 18, fontWeight: '700', color: colors.text},
  list: {padding: 16},
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4},
  payeeName: {fontSize: 16, fontWeight: '600', color: colors.text},
  amount: {fontSize: 16, fontWeight: '700', color: colors.primary},
  vpa: {fontSize: 12, color: colors.textSecondary, marginBottom: 6},
  date: {fontSize: 11, color: colors.textDim},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8},
  emptyIcon: {fontSize: 48},
  emptyText: {fontSize: 18, fontWeight: '600', color: colors.textSecondary},
  emptySubtext: {fontSize: 14, color: colors.textDim},
});
