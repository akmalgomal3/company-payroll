import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHelper {
  private readonly cryptoKey: string;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('CRYPTO_SECRET_KEY');
    if (!key) {
      throw new Error(
        'CRYPTO_SECRET_KEY is not defined in the environment variables',
      );
    }
    this.cryptoKey = key;
  }

  decrypt(encryptedPass: string): string | null {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedPass, this.cryptoKey);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText || null;
    } catch (error) {
      return null;
    }
  }

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
