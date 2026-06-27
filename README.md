# 觉照验证器 JueZhao Authenticator

RFC 6238 兼容的 TOTP 验证器，纯浏览器端运行，密钥本地 AES-256-GCM 加密存储。

## 功能

- ✅ TOTP 验证码生成（RFC 6238）
- ✅ 支持 SHA1 / SHA256 / SHA512 算法
- ✅ 6 位 / 8 位验证码
- ✅ 30 秒 / 60 秒刷新周期
- ✅ 扫码添加（otpauth:// URI）
- ✅ 手动输入 Base32 密钥
- ✅ 深色主题护眼
- ✅ 每秒自动刷新
- ✅ 进度条倒计时
- ✅ PWA 离线支持
- ✅ 密钥 AES-256-GCM 加密本地存储

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **密码学**: Web Crypto API (纯浏览器实现，无外部依赖)
- **包管理**: pnpm
- **存储**: localStorage + AES-256-GCM 加密

## 开发

```bash
pnpm install
pnpm dev        # 启动开发服务器
pnpm type-check # 类型检查
pnpm test       # 运行测试
pnpm build      # 生产构建
```

## 构建

```bash
pnpm build
pnpm start      # 启动生产服务器
```

## 安全

- 所有密钥使用 AES-256-GCM 加密存储在浏览器 localStorage
- 加密密钥通过 PBKDF2 派生（600,000 次迭代）
- 纯本地运行，无需网络权限，密钥不上传任何服务器

## License

Apache-2.0
