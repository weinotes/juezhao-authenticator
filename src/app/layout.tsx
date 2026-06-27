import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AccountProvider } from '@/hooks/useAccounts';

export const metadata: Metadata = {
  title: '觉照验证器',
  description: 'JueZhao Authenticator - RFC 6238 TOTP 验证器',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: '觉照验证器', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f0f1a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AccountProvider>{children}</AccountProvider>
      </body>
    </html>
  );
}
