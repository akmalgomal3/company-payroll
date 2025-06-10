import { Module } from '@nestjs/common';
import { PasswordHelper } from './helpers/password.helper';

@Module({
  providers: [PasswordHelper],
  exports: [PasswordHelper],
})
export class SharedModule {}
