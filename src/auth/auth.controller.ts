import {
  Controller,
  Post,
  Body,
  UsePipes,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { DecryptPasswordPipe } from './pipes/decrypt-password.pipe';
import { LoginDto } from './dto/login.dto';
import { AuditService } from '../audit/audit.service';
import { JwtService } from '@nestjs/jwt';
import { IpAddress } from './decorators/ip-address.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @UsePipes(DecryptPasswordPipe)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid encrypted password format.',
  })
  async login(
    @Body() loginDto: LoginDto,
    @IpAddress() ip: string,
    @Request() req: any,
  ) {
    const tokenPayload = await this.authService.login(loginDto);
    const decodedToken = this.jwtService.decode(tokenPayload.access_token) as {
      sub: string;
    };
    const userId = decodedToken.sub;

    await this.auditService.log({
      userId: userId,
      action: 'USER_LOGIN_SUCCESS',
      entity: 'Auth',
      entityId: userId,
      ipAddress: ip,
      requestId: req.requestId,
      details: { username: loginDto.username },
    });

    return {
      message: 'Login successful',
      data: tokenPayload,
    };
  }
}
