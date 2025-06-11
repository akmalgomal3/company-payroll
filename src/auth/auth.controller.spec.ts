import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordHelper } from '../shared/helpers/password.helper';
import { LoginDto } from './dto/login.dto';
import { AuditService } from '../audit/audit.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUsersService = {};
  const mockJwtService = {
    decode: jest.fn().mockReturnValue({ sub: 'user-id-from-token' }),
  };
  const mockPasswordHelper = {
    decrypt: jest.fn().mockImplementation((pass) => pass),
  };
  const mockAuditService = {
    log: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PasswordHelper, useValue: mockPasswordHelper },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login, log the audit, and return an access token on success', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'encryptedPassword',
      };
      const expectedToken = { access_token: 'mock-jwt-token' };
      const mockIp = '127.0.0.1';
      const mockReq = { requestId: 'mock-req-id' };

      const loginSpy = jest
        .spyOn(authService, 'login')
        .mockResolvedValue(expectedToken);

      const result = await controller.login(loginDto, mockIp, mockReq);

      expect(loginSpy).toHaveBeenCalledWith(loginDto);
      expect(mockAuditService.log).toHaveBeenCalled();
      expect(result.data).toEqual(expectedToken);
      expect(result.message).toEqual('Login successful');
    });

    it('should throw UnauthorizedException on failed login', async () => {
      const loginDto: LoginDto = { username: 'wrong', password: 'wrong' };
      const mockIp = '127.0.0.1';
      const mockReq = { requestId: 'mock-req-id' };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(loginDto, mockIp, mockReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
