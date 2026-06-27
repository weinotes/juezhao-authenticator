/**
 * @file Add Manual Screen — Manual Base32 entry
 * @author Davey Wong (wgwcko@gmail.com)
 * @copyright 2026 Davey Wong <wgwcko@gmail.com>
 * @license Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAccounts } from '../src/contexts/AccountContext';
import { validateSecret } from '../src/lib/totp';
import { Colors, Spacing, FontSizes, BorderRadius } from '../src/lib/theme';

const ALGORITHMS = ['SHA1', 'SHA256', 'SHA512'] as const;
const DIGITS = [6, 8];
const PERIODS = [30, 60];

export default function AddManualScreen() {
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [secret, setSecret] = useState('');
  const [algorithm, setAlgorithm] = useState<'SHA1' | 'SHA256' | 'SHA512'>('SHA1');
  const [digits, setDigits] = useState(6);
  const [period, setPeriod] = useState(30);
  const [busy, setBusy] = useState(false);
  const { addAccount } = useAccounts();

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) { Alert.alert('错误', '请输入账户名称'); return; }
    if (!secret.trim()) { Alert.alert('错误', '请输入密钥'); return; }

    const clean = secret.trim().toUpperCase().replace(/\s/g, '');
    if (!validateSecret(clean)) {
      Alert.alert('错误', '密钥格式不正确。\n请输入有效的 Base32 编码（字母 A-Z 和数字 2-7）\n\n示例：JBSWY3DPEHPK3PXP');
      return;
    }

    setBusy(true);
    try {
      await addAccount({ name: name.trim(), issuer: issuer.trim() || null, secret: clean, algorithm, digits, period });
      Alert.alert('成功', '账户已成功添加', [{ text: '确定', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('添加失败', e.message || '未知错误');
    } finally { setBusy(false); }
  }, [name, issuer, secret, algorithm, digits, period, addAccount]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.group}>
            <Text style={styles.label}>账户名称 <Text style={styles.required}>*</Text></Text>
            <TextInput style={styles.input} placeholder="例如：GitHub" placeholderTextColor={Colors.textMuted}
              value={name} onChangeText={setName} autoCapitalize="words" maxLength={50} />
          </View>

          {/* Issuer */}
          <View style={styles.group}>
            <Text style={styles.label}>发行方（可选）</Text>
            <TextInput style={styles.input} placeholder="例如：GitHub Inc." placeholderTextColor={Colors.textMuted}
              value={issuer} onChangeText={setIssuer} maxLength={50} />
          </View>

          {/* Secret */}
          <View style={styles.group}>
            <Text style={styles.label}>密钥 (Base32) <Text style={styles.required}>*</Text></Text>
            <TextInput style={[styles.input, styles.secretInput]} placeholder="JBSWY3DPEHPK3PXP"
              placeholderTextColor={Colors.textMuted} value={secret}
              onChangeText={(t) => setSecret(t.toUpperCase())} autoCapitalize="characters"
              autoCorrect={false} maxLength={64} />
            <Text style={styles.hint}>仅包含字母 A-Z 和数字 2-7</Text>
          </View>

          {/* Algorithm */}
          <View style={styles.group}>
            <Text style={styles.label}>算法</Text>
            <View style={styles.row}>
              {ALGORITHMS.map((a) => (
                <TouchableOpacity key={a} style={[styles.opt, algorithm === a && styles.optSel]} onPress={() => setAlgorithm(a)}>
                  <Text style={[styles.optText, algorithm === a && styles.optTextSel]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Digits */}
          <View style={styles.group}>
            <Text style={styles.label}>验证码位数</Text>
            <View style={styles.row}>
              {DIGITS.map((d) => (
                <TouchableOpacity key={d} style={[styles.opt, digits === d && styles.optSel]} onPress={() => setDigits(d)}>
                  <Text style={[styles.optText, digits === d && styles.optTextSel]}>{d} 位</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Period */}
          <View style={styles.group}>
            <Text style={styles.label}>刷新周期</Text>
            <View style={styles.row}>
              {PERIODS.map((p) => (
                <TouchableOpacity key={p} style={[styles.opt, period === p && styles.optSel]} onPress={() => setPeriod(p)}>
                  <Text style={[styles.optText, period === p && styles.optTextSel]}>{p} 秒</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.submit, busy && styles.submitDisabled]} onPress={handleSubmit} disabled={busy}>
          {busy ? <ActivityIndicator size="small" color={Colors.text} /> : <Text style={styles.submitText}>添加账户</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ℹ️ 所有密钥使用 iOS Keychain / Android Keystore 加密存储，不会上传到任何服务器
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl * 2 },
  form: { gap: Spacing.lg },
  group: { gap: Spacing.xs },
  label: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  required: { color: Colors.error },
  input: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSizes.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border, minHeight: 48 },
  secretInput: { fontFamily: 'monospace', letterSpacing: 2, fontSize: FontSizes.lg },
  hint: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 4 },
  row: { flexDirection: 'row', gap: Spacing.sm },
  opt: { flex: 1, backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, minHeight: 48, justifyContent: 'center' },
  optSel: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optText: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600' },
  optTextSel: { color: Colors.text },
  submit: { backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl, minHeight: 52 },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: Colors.text, fontSize: FontSizes.md, fontWeight: '600' },
  footer: { marginTop: Spacing.xl, padding: Spacing.md, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  footerText: { fontSize: FontSizes.xs, color: Colors.textMuted, lineHeight: 20 },
});
