import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prisma: PrismaService;

  beforeEach(() => {
    jwtService = { sign: jest.fn().mockReturnValue('signed-jwt-token') } as any;
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    } as any;

    service = new AuthService(jwtService, prisma);
  });

  describe('signup', () => {
    it('should throw UnauthorizedException for invalid email format', async () => {
      await expect(
        service.signup('invalid-email', 'Password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for weak password', async () => {
      await expect(service.signup('test@example.com', 'weak')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const prismaError = {
        code: 'P2002',
        message: 'Duplicate entry',
        name: 'PrismaClientKnownRequestError',
        clientVersion: 'prisma-client-version',
        meta: {},
      };

      Object.setPrototypeOf(
        prismaError,
        Prisma.PrismaClientKnownRequestError.prototype,
      );

      (prisma.user.create as jest.Mock).mockRejectedValue(prismaError);

      await expect(
        service.signup('test@example.com', 'Password123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return safe response on success', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER',
      });

      const result = await service.signup('test@example.com', 'Password123');

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com', password: 'hashedPassword' },
      });
      expect(result).toEqual({
        message: 'User registered successfully',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'USER',
        },
      });
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        service.signup('test@example.com', 'Password123'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login('test@example.com', 'Password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is missing', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        password: null,
      });

      await expect(
        service.login('test@example.com', 'Password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('test@example.com', 'Password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return JWT token on successful login', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@example.com', 'Password123');

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'test@example.com',
        role: 'USER',
      });
      expect(result).toEqual({
        access_token: 'signed-jwt-token',
        expires_in: 3600,
      });
    });
  });
});
