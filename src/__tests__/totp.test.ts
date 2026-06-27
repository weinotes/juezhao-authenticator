import { generateTOTP, parseOtpauthUri, validateSecret, generateSecret, b32encode } from '../lib/totp';

describe('TOTP', () => {
  describe('generateTOTP', () => {
    it('生成6位验证码', async () => {
      const r = await generateTOTP('JBSWY3DPEHPK3PXP');
      expect(r.code).toHaveLength(6);
      expect(/^\d{6}$/.test(r.code)).toBe(true);
      expect(r.remainingSeconds).toBeGreaterThanOrEqual(0);
      expect(r.remainingSeconds).toBeLessThanOrEqual(30);
    });

    it('生成8位验证码', async () => {
      const r = await generateTOTP('JBSWY3DPEHPK3PXP', { digits: 8 });
      expect(r.code).toHaveLength(8);
    });

    it('拒绝空密钥', async () => {
      await expect(generateTOTP('')).rejects.toThrow('Secret cannot be empty');
    });

    it('拒绝无效 Base32', async () => {
      await expect(generateTOTP('INVALID!@#')).rejects.toThrow('Invalid base32 secret');
    });

    it('处理空格', async () => {
      const r = await generateTOTP('JBSW Y3DP EHPK 3PXP');
      expect(r.code).toHaveLength(6);
    });

    it('处理小写', async () => {
      const r = await generateTOTP('jbswy3dpehpk3pxp');
      expect(r.code).toHaveLength(6);
    });
  });

  describe('parseOtpauthUri', () => {
    const testUri = 'otpauth://totp/Google:user@gmail.com?secret=JBSWY3DPEHPK3PXP&issuer=Google';

    it('解析标准URI', () => {
      const r = parseOtpauthUri(testUri);
      expect(r).not.toBeNull();
      expect(r!.type).toBe('totp');
      expect(r!.label).toBe('user@gmail.com');
      expect(r!.issuer).toBe('Google');
      expect(r!.secret).toBe('JBSWY3DPEHPK3PXP');
    });

    it('处理无发行方的URI', () => {
      const r = parseOtpauthUri('otpauth://totp/user@example.com?secret=JBSWY3DPEHPK3PXP');
      expect(r?.label).toBe('user@example.com');
    });

    it('返回null给非totp协议', () => {
      expect(parseOtpauthUri('http://example.com')).toBeNull();
      expect(parseOtpauthUri('otpauth://hotp/test?secret=X')).toBeNull();
    });

    it('返回null给缺少密钥的URI', () => {
      expect(parseOtpauthUri('otpauth://totp/Test')).toBeNull();
    });
  });

  describe('validateSecret', () => {
    it('校验有效密钥', () => { expect(validateSecret('JBSWY3DPEHPK3PXP')).toBe(true); });
    it('拒绝空密钥', () => { expect(validateSecret('')).toBe(false); });
    it('拒绝短密钥', () => { expect(validateSecret('JBSWY3D')).toBe(false); });
  });

  describe('generateSecret', () => {
    it('生成Base32字符串', () => { expect(generateSecret()).toMatch(/^[A-Z2-7]+$/); });
    it('每次不同', () => { expect(generateSecret()).not.toBe(generateSecret()); });
  });

  describe('b32encode', () => {
    it('编码已知字节', () => {
      expect(b32encode(new Uint8Array([0, 0, 0]))).toBe('AAAAA');
    });
  });
});
