/**
 * @file Home Screen — Account list with TOTP codes
 * @author Davey Wong (wgwcko@gmail.com)
 * @license Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { useAccounts, AccountWithCode } from '../src/contexts/AccountContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../src/lib/theme';

function formatCode(code: string): string {
  if (code.length === 6) return code.slice(0, 3) + ' ' + code.slice(3);
  if (code.length === 8) return code.slice(0, 4) + ' ' + code.slice(4);
  return code;
}

function AccountCard({ account, onDelete }: { account: AccountWithCode; onDelete: () => void }) {
  const pct = account.remainingSeconds / account.period;
  const barColor = pct > 0.3 ? Colors.codeColor : Colors.warning;

  return (
    <TouchableOpacity
      style={styles.card}
      onLongPress={onDelete}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{account.name}</Text>
          {account.issuer && <Text style={styles.cardIssuer}>{account.issuer}</Text>}
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{account.algorithm}</Text>
        </View>
      </View>

      <Text style={styles.codeText}>{formatCode(account.code)}</Text>

      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
      </View>

      <Text style={styles.timer}>{account.remainingSeconds}s / {account.period}s</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { accountsWithCodes, isLoading, deleteAccount } = useAccounts();
  const [refreshing, setRefreshing] = useState(false);

  const handleDelete = useCallback((acc: AccountWithCode) => {
    Alert.alert('删除账户', `确定要删除「${acc.name}」？此操作不可恢复。`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deleteAccount(acc.id) },
    ]);
  }, [deleteAccount]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>觉照验证器</Text>
        <Text style={styles.subtitle}>{accountsWithCodes.length} 个账户 · RFC 6238</Text>
      </View>

      {accountsWithCodes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔐</Text>
          <Text style={styles.emptyTitle}>暂无账户</Text>
          <Text style={styles.emptyHint}>扫描二维码或手动输入密钥来添加账户</Text>
        </View>
      ) : (
        <FlatList
          data={accountsWithCodes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AccountCard account={item} onDelete={() => handleDelete(item)} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.actions}>
        <Link href="/scan" asChild>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]}>
            <Text style={styles.btnText}>扫码添加</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/add-manual" asChild>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]}>
            <Text style={styles.btnTextSec}>手动输入</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { marginTop: Spacing.md, color: Colors.textSecondary, fontSize: FontSizes.md },
  header: { padding: Spacing.lg, paddingTop: Spacing.xl + 24, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  title: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  list: { padding: Spacing.md, paddingBottom: 100 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  cardInfo: { flex: 1 },
  cardName: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.text },
  cardIssuer: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  badge: { backgroundColor: Colors.surfaceLight, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: FontSizes.xs, color: Colors.textMuted, fontWeight: '600' },
  codeText: { fontSize: FontSizes.code, fontWeight: 'bold', color: Colors.codeColor, letterSpacing: 4, fontFamily: 'monospace', textAlign: 'center', marginVertical: Spacing.sm },
  progressBg: { height: 4, backgroundColor: Colors.surfaceLight, borderRadius: 2, marginTop: Spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  timer: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: Spacing.xs, textAlign: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl },
  emptyIcon: { fontSize: 64, marginBottom: Spacing.lg },
  emptyTitle: { fontSize: FontSizes.xl, color: Colors.textSecondary, fontWeight: 'bold' },
  emptyHint: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.sm, textAlign: 'center' },
  actions: { flexDirection: 'row', padding: Spacing.lg, gap: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  btn: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: Colors.primary },
  btnSecondary: { backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.border },
  btnText: { color: Colors.text, fontSize: FontSizes.md, fontWeight: '600' },
  btnTextSec: { color: Colors.textSecondary, fontSize: FontSizes.md, fontWeight: '600' },
});
