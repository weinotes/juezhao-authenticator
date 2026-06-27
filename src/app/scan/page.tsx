'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccounts } from '@/hooks/useAccounts';

export default function ScanPage() {
  const router = useRouter();
  const { addAccountFromUri } = useAccounts();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(true);
  const [msg, setMsg] = useState('');
  const streamRef = useRef<MediaStream | null>(null);

  // 启动摄像头
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch {
        setMsg('无法访问摄像头，请授予摄像头权限');
      }
    })();
    return () => { cancelled = true; if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, []);

  // 简易二维码检测（基于 canvas 每隔 1s 截帧 + 条码检测 API）
  useEffect(() => {
    if (!scanning) return;
    const iv = setInterval(async () => {
      const v = videoRef.current;
      if (!v || !v.videoWidth) return;
      try {
        const bd = new BarcodeDetector({ formats: ['qr_code'] });
        const codes = await bd.detect(v);
        if (codes.length > 0) {
          const uri = codes[0].rawValue;
          if (uri.startsWith('otpauth://')) {
            setScanning(false);
            try {
              await addAccountFromUri(uri);
              alert('账户已成功添加！');
              router.back();
            } catch (e: any) {
              alert('添加失败：' + e.message);
              setScanning(true);
            }
          }
        }
      } catch { /* barcode detector not ready */ }
    }, 1500);
    return () => clearInterval(iv);
  }, [scanning, addAccountFromUri, router]);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#0f0f1a', display: 'flex', flexDirection: 'column' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #27272a', background: '#1a1a2e' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', padding: '0 8px 0 0' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: 0 }}>扫描二维码</h1>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {msg ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
            <p style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>{msg}</p>
            <button onClick={() => router.back()} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontSize: 16, cursor: 'pointer' }}>返回</button>
          </div>
        ) : (
          <>
            <div style={{ width: 280, height: 280, borderRadius: 16, overflow: 'hidden', border: '2px solid #6366f1', position: 'relative' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {/* 四角标记 */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: 32, height: 32, borderTop: '3px solid #22d3ee', borderLeft: '3px solid #22d3ee', borderTopLeftRadius: 8 }} />
              <div style={{ position: 'absolute', top: 0, right: 0, width: 32, height: 32, borderTop: '3px solid #22d3ee', borderRight: '3px solid #22d3ee', borderTopRightRadius: 8 }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: 32, height: 32, borderBottom: '3px solid #22d3ee', borderLeft: '3px solid #22d3ee', borderBottomLeftRadius: 8 }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderBottom: '3px solid #22d3ee', borderRight: '3px solid #22d3ee', borderBottomRightRadius: 8 }} />
            </div>
            <p style={{ color: '#a1a1aa', marginTop: 20, textAlign: 'center' }}>将 otpauth:// 二维码放入框内扫描</p>
          </>
        )}
      </div>
    </div>
  );
}
