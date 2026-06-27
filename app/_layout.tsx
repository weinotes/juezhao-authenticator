/**
 * @file Root Layout — Expo Router
 * @author Davey Wong (wgwcko@gmail.com)
 * @license Apache-2.0
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { AccountProvider } from '../src/contexts/AccountContext';
import { Colors } from '../src/lib/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try { /* load assets if any */ } catch {}
      setReady(true);
      await SplashScreen.hideAsync();
    })();
  }, []);

  if (!ready) return null;

  return (
    <AccountProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          contentStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ title: '觉照验证器' }} />
        <Stack.Screen name="scan" options={{ title: '扫描二维码', presentation: 'modal' }} />
        <Stack.Screen name="add-manual" options={{ title: '手动添加', presentation: 'modal' }} />
      </Stack>
    </AccountProvider>
  );
}
