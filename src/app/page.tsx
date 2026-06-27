'use client';

import { useCallback } from 'react';
import { useAccounts, AccountWithCode } from '@/hooks/useAccounts';
import Link from 'next/link';

/* ── 格式化验证码：123 456 ──────────────────────────────────── */
function fmtCode(c: string): string {
  if (c.length === 6) return c.slice(0, 3) + ' ' + c.slice(3);
  if (c.length === 8) return c.slice(0, 4) + ' ' + c.slice(4);
  return c;
}

/* ── 账户卡片 ───────────────────────────────────────────────── */
function Card({ acc, onDel }: { acc: AccountWithCode; onDel: () => void }) {
  const pct = acc.remainingSeconds / (acc.period || 30);
  const barColor = pct > 0.3 ? '#22d3ee' : '#f59e0b';

  return (
    <div
      onClick={onDel}
      style={{
        background: '#1a1a2e', borderRadius: 16, padding: 20, marginBottom: 12,
        border: '1px solid #27272a', cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>{acc.name}</div>
          {acc.issuer && <div style={{ color: '#a1a1aa', fontSize: 13, marginTop: 2 }}>{acc.issuer}</div>}
        </div>
        <span style={{
          background: '#252542', padding: '2px 8px', borderRadius: 6, fontSize: 11, color: '#71717a', fontWeight: 600,
        }}>{acc.algorithm}</span>
      </div>

      {/* 验证码 */}
      <div style={{
        color: barColor, fontSize: 36, fontWeight: 'bold', fontFamily: 'monospace',
        textAlign: 'center', letterSpacing: 6, margin: '10px 0',
      }}>{fmtCode(acc.code)}</div>

      {/* 进度条 */}
      <div style={{ height: 4, background: '#252542', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: barColor, borderRadius: 2, transition: 'width 1s linear' }} />
      </div>

      <div style={{ color: '#71717a', fontSize: 11, textAlign: 'center', marginTop: 6 }}>
        {acc.remainingSeconds}s / {acc.period}s
      </div>
    </div>
  );
}

/* ── 主页 ────────────────────────────────────────────────────── */
export default function Home() {
  const { accountsWithCodes: items, isLoading, deleteAccount } = useAccounts();

  const handleDel = useCallback((acc: AccountWithCode) => {
    if (window.confirm(`确定删除「${acc.name}」？此操作不可恢复。`)) {
      deleteAccount(acc.id);
    }
  }, [deleteAccount]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#a1a1aa' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 头部 */}
      <div style={{ padding: '24px 0', borderBottom: '1px solid #27272a', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>觉照验证器</h1>
        <p style={{ color: '#a1a1aa', fontSize: 14, marginTop: 4 }}>{items.length} 个账户 · RFC 6238</p>
      </div>

      {/* 列表或空状态 */}
      {items.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#71717a' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔐</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#a1a1aa', marginBottom: 8 }}>暂无账户</div>
          <div style={{ fontSize: 14, textAlign: 'center' }}>扫描二维码或手动输入密钥添加账户</div>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 100 }}>
          {items.map(acc => <Card key={acc.id} acc={acc} onDel={() => handleDel(acc)} />)}
        </div>
      )}

      {/* 底部按钮 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', gap: 12, padding: 16,
        background: '#1a1a2e', borderTop: '1px solid #27272a', maxWidth: 480, margin: '0 auto',
      }}>
        <Link href="/scan" style={{ flex: 1, background: '#6366f1', color: '#fff', textAlign: 'center', padding: '14px 0', borderRadius: 12, fontWeight: 600, textDecoration: 'none' }}>
          扫码添加
        </Link>
        <Link href="/add-manual" style={{ flex: 1, background: '#252542', color: '#a1a1aa', textAlign: 'center', padding: '14px 0', borderRadius: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid #27272a' }}>
          手动输入
        </Link>
      </div>
    </div>
  );
}
