import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { PasswordHelper } from '../../shared/helpers/password.helper';

@Injectable()
export class DecryptPasswordPipe implements PipeTransform {
  constructor(private readonly passwordHelper: PasswordHelper) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && value.password) {
      const decryptedPassword = this.passwordHelper.decrypt(value.password);
      if (!decryptedPassword) {
        throw new BadRequestException('Invalid encrypted password format.');
      }
      value.password = decryptedPassword;
    }
    return value;
  }
}
