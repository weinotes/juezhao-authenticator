# 觉照验证器 JueZhao Authenticator

> RFC 6238 兼容的 TOTP 验证器 — 纯浏览器运行，零服务器依赖。

中文 | [English](README.md)

## 功能

- **TOTP 验证码生成** — 符合 RFC 6238 标准
- **多算法支持** — SHA1 / SHA256 / SHA512
- **灵活位数** — 6 位或 8 位验证码
- **自定义周期** — 30 秒或 60 秒刷新间隔
- **二维码扫描** — 通过 `otpauth://` URI 导入账户（BarcodeDetector API）
- **手动输入** — 使用 Base32 密钥添加账户
- **安全存储** — AES-256-GCM 加密本地存储（PBKDF2，60 万次迭代）
- **深色主题** — 护眼暗色 UI，带进度条倒计时
- **自动刷新** — 每秒更新验证码
- **PWA 支持** — 可作为独立应用安装

## 技术栈

| 层 | 技术 |
|-------|-----------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript (严格模式) |
| 密码学 | Web Crypto API（零 npm 密码学依赖） |
| 存储 | localStorage + AES-256-GCM |
| 包管理 | pnpm |
| CI/CD | GitHub Actions |

## 快速开始

```bash
pnpm install
pnpm dev        # 启动开发服务器 http://localhost:3000
pnpm type-check # TypeScript 类型检查
pnpm test       # 运行单元测试
pnpm build      # 生产构建
```

## 安全性

- 所有 TOTP 密钥使用 **AES-256-GCM** 加密后存储在 `localStorage`
- 加密密钥通过 **PBKDF2** 派生（**600,000 次迭代**）
- **不向任何服务器传输数据** — 完全离线运行
- 应用**无需网络权限**

## 项目结构

```
src/
├── lib/
│   ├── totp.ts      # RFC 6238 TOTP 核心（纯 Web Crypto API）
│   ├── storage.ts   # AES-256-GCM 加密存储
│   └── theme.ts     # 深色主题变量
├── hooks/
│   └── useAccounts.tsx  # 账户状态管理
└── app/
    ├── page.tsx         # 主页 — 账户列表 + TOTP 码
    ├── scan/page.tsx    # 二维码扫描
    └── add-manual/page.tsx  # 手动添加账户
```

## 许可证

Apache 2.0 — 详见 [LICENSE](LICENSE)。

作者：**Davey Wong** [wgwcko@gmail.com]
