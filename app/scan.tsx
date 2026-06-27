/**
 * @file Scan QR Screen — Camera-based otpauth:// scanner
 * @author Davey Wong (wgwcko@gmail.com)
 * @license Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useAccounts } from '../src/contexts/AccountContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../src/lib/theme';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { addAccountFromUri } = useAccounts();

  const handleScan = useCallback(async ({ data }: { data: string }) => {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);

    try {
      if (!data.startsWith('otpauth://')) {
        throw new Error('请扫描有效的 TOTP 二维码');
      }
      await addAccountFromUri(data);
      Alert.alert('成功', '账户已成功添加', [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('添加失败', e.message || '未知错误', [
        { text: '重试', onPress: () => { setScanned(false); setProcessing(false); } },
        { text: '取消', style: 'cancel', onPress: () => router.back() },
      ]);
    }
  }, [scanned, processing, addAccountFromUri]);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission, requestPermission]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.statusText}>请求相机权限中...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.statusText}>需要相机权限</Text>
        <Text style={styles.hint}>觉照验证器需要访问摄像头来扫描二维码</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>授予权限</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
          <Text style={styles.scanHint}>将二维码放入框内扫描</Text>
          {processing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color={Colors.text} />
              <Text style={styles.processingText}>处理中...</Text>
            </View>
          )}
        </View>
      </CameraView>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelBtnText}>取消</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  camera: { flex: 1, width: '100%' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  scanArea: { width: 260, height: 260, position: 'relative' },
  corner: { position: 'absolute', width: 36, height: 36, borderColor: Colors.primary },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  scanHint: { color: Colors.text, fontSize: FontSizes.md, marginTop: Spacing.lg, textAlign: 'center', paddingHorizontal: Spacing.xl },
  processingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  processingText: { color: Colors.text, fontSize: FontSizes.md, marginTop: Spacing.md },
  icon: { fontSize: 64, marginBottom: Spacing.lg },
  statusText: { color: Colors.text, fontSize: FontSizes.lg, fontWeight: 'bold', textAlign: 'center', padding: Spacing.lg },
  hint: { color: Colors.text, fontSize: FontSizes.md, textAlign: 'center', paddingHorizontal: Spacing.xl },
  permBtn: { backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.xl, paddingHorizontal: Spacing.xl },
  permBtnText: { color: Colors.text, fontSize: FontSizes.md, fontWeight: '600' },
  cancelBtn: { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' },
  cancelBtnText: { color: Colors.text, fontSize: FontSizes.md, fontWeight: '600', padding: Spacing.md },
});
