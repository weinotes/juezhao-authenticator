'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAccounts } from '@/hooks/useAccounts';
import { validateSecret } from '@/lib/totp';

const ALGOS = ['SHA1', 'SHA256', 'SHA512'] as const;
const DIGITS = [6, 8];
const PERIODS = [30, 60];

export default function AddManualPage() {
  const router = useRouter();
  const { addAccount } = useAccounts();

  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [secret, setSecret] = useState('');
  const [algorithm, setAlgorithm] = useState<'SHA1' | 'SHA256' | 'SHA512'>('SHA1');
  const [digits, setDigits] = useState(6);
  const [period, setPeriod] = useState(30);
  const [busy, setBusy] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) { alert('请输入账户名称'); return; }
    if (!secret.trim()) { alert('请输入密钥'); return; }

    const clean = secret.trim().toUpperCase().replace(/\s/g, '');
    if (!validateSecret(clean)) {
      alert('密钥格式不正确。请输入有效的 Base32 编码\n\n示例：JBSWY3DPEHPK3PXP');
      return;
    }

    setBusy(true);
    try {
      await addAccount({ name: name.trim(), issuer: issuer.trim() || null, secret: clean, algorithm, digits, period });
      alert('账户已成功添加！');
      router.back();
    } catch (e: any) {
      alert('添加失败：' + (e.message || '未知错误'));
    } finally { setBusy(false); }
  }, [name, issuer, secret, algorithm, digits, period, addAccount, router]);

  const btn = (sel: boolean) => ({
    flex: 1, padding: '12px 0', borderRadius: 10, textAlign: 'center' as const,
    background: sel ? '#6366f1' : '#252542',
    border: sel ? '1px solid #6366f1' : '1px solid #27272a',
    color: sel ? '#fff' : '#a1a1aa', fontWeight: 600, fontSize: 14, cursor: 'pointer',
  });

  const inputStyle = {
    width: '100%', background: '#1a1a2e', border: '1px solid #27272a', borderRadius: 10,
    padding: '12px 14px', color: '#fff', fontSize: 15, outline: 'none', marginTop: 6,
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#0f0f1a' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #27272a', background: '#1a1a2e' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', padding: '0 8px 0 0' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: 0 }}>手动添加账户</h1>
      </div>

      <div style={{ padding: 20 }}>
        <p style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 20 }}>输入账户信息和 Base32 密钥</p>

        {/* 账户名称 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500 }}>账户名称 <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="例如：GitHub" maxLength={50} style={inputStyle} />
        </div>

        {/* 发行方 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500 }}>发行方（可选）</label>
          <input value={issuer} onChange={e => setIssuer(e.target.value)} placeholder="例如：GitHub Inc." maxLength={50} style={inputStyle} />
        </div>

        {/* 密钥 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500 }}>密钥 (Base32) <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={secret} onChange={e => setSecret(e.target.value.toUpperCase())} placeholder="JBSWY3DPEHPK3PXP" maxLength={64}
            style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: 2, fontSize: 16 }} />
          <p style={{ color: '#71717a', fontSize: 11, marginTop: 4 }}>仅包含字母 A-Z 和数字 2-7</p>
        </div>

        {/* 算法 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>算法</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {ALGOS.map(a => <div key={a} style={btn(algorithm === a)} onClick={() => setAlgorithm(a)}>{a}</div>)}
          </div>
        </div>

        {/* 位数 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>验证码位数</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {DIGITS.map(d => <div key={d} style={btn(digits === d)} onClick={() => setDigits(d)}>{d} 位</div>)}
          </div>
        </div>

        {/* 周期 */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>刷新周期</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {PERIODS.map(p => <div key={p} style={btn(period === p)} onClick={() => setPeriod(p)}>{p} 秒</div>)}
          </div>
        </div>

        {/* 提交按钮 */}
        <button onClick={handleSubmit} disabled={busy} style={{
          width: '100%', padding: 14, background: busy ? '#4f46e5' : '#6366f1', color: '#fff',
          border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer',
          opacity: busy ? 0.7 : 1,
        }}>
          {busy ? '添加中...' : '添加账户'}
        </button>

        {/* 隐私提示 */}
        <div style={{ marginTop: 20, padding: 14, background: '#1a1a2e', borderRadius: 10, border: '1px solid #27272a' }}>
          <p style={{ color: '#71717a', fontSize: 12, lineHeight: 1.6 }}>
            ℹ️ 所有密钥使用 AES-256-GCM 加密存储在浏览器本地，不会上传任何服务器。
          </p>
        </div>
      </div>
    </div>
  );
}
