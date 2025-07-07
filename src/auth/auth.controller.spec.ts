import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(() => {
    authService = {
      signup: jest.fn(),
      login: jest.fn(),
    } as any;

    controller = new AuthController(authService);
  });

  describe('signup', () => {
    const signupDto: SignupDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should call authService.signup and return result', async () => {
      (authService.signup as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: signupDto.email,
      });

      const result = await controller.signup(signupDto);

      expect(authService.signup).toHaveBeenCalledWith(
        signupDto.email,
        signupDto.password,
      );
      expect(result).toEqual({ id: 'user-id', email: signupDto.email });
    });

    it('should throw ConflictException if authService.signup throws ConflictException', async () => {
      (authService.signup as jest.Mock).mockRejectedValue(
        new ConflictException('Email exists'),
      );

      await expect(controller.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      (authService.signup as jest.Mock).mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(controller.signup(signupDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should call authService.login and return result', async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        token: 'jwt-token',
      });

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(result).toEqual({ token: 'jwt-token' });
    });

    it('should throw UnauthorizedException if authService.login throws UnauthorizedException', async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
