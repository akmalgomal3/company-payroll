import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordHelper } from '../shared/helpers/password.helper';
import { User } from '../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../users/enums/role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByUsername: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockPasswordHelper = {
    compare: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PasswordHelper, useValue: mockPasswordHelper },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data if validation is successful', async () => {
      const mockUser = {
        id: 'user-uuid',
        username: 'testuser',
        password: 'hashedPassword',
        role: Role.Employee,
      } as User;
      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      mockPasswordHelper.compare.mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'plainPassword');

      expect(result).not.toHaveProperty('password');
      expect(result.username).toEqual('testuser');
    });

    it('should return null if user not found', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);
      const result = await service.validateUser('wronguser', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const mockUser = { password: 'hashedPassword' } as User;
      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      mockPasswordHelper.compare.mockResolvedValue(false); // Password salah
      const result = await service.validateUser('testuser', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token for a valid user', async () => {
      const mockUser = {
        id: 'user-uuid',
        username: 'testuser',
        password: 'hashedPassword',
        role: Role.Employee,
      };
      const mockToken = 'mock-jwt-token';

      const validateUserSpy = jest
        .spyOn(service, 'validateUser')
        .mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login({
        username: 'testuser',
        password: 'password',
      });

      expect(validateUserSpy).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
        role: mockUser.role,
      });
      expect(result).toEqual({ access_token: mockToken });
    });

    it('should throw UnauthorizedException for an invalid user', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null); // User tidak valid

      await expect(
        service.login({ username: 'wrong', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
