import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordHelper } from '../shared/helpers/password.helper';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUsersService = {};
  const mockJwtService = {};
  const mockPasswordHelper = {
    decrypt: jest.fn().mockImplementation((pass) => pass),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PasswordHelper, useValue: mockPasswordHelper },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return an access token', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'encryptedPassword',
      };
      const expectedToken = { access_token: 'mock-jwt-token' };

      const loginSpy = jest
        .spyOn(authService, 'login')
        .mockResolvedValue(expectedToken);

      const result = await controller.login(loginDto);

      expect(loginSpy).toHaveBeenCalledWith(loginDto);
      expect(result.data).toEqual(expectedToken);
      expect(result.message).toEqual('Login successful');
    });
  });
});
