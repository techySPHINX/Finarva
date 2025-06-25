import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signup(email: string, password: string) {
    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new UnauthorizedException('Invalid email format');
    }

    // Validate password strength
    if (!this.isStrongPassword(password)) {
      throw new UnauthorizedException(
        'Password does not meet security requirements',
      );
    }

    try {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new ConflictException('Email already registered');
      }

      const hashed = await bcrypt.hash(password, this.SALT_ROUNDS);
      const user = await this.prisma.user.create({
        data: { email, password: hashed },
      });

      // Omit sensitive data from response
      const { password: _, ...safeUser } = user;
      return {
        message: 'User registered successfully',
        user: safeUser,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already registered');
        } else if (error.code === 'P2003') {
          throw new UnauthorizedException('Invalid role reference');
        }
      }
      if (error instanceof Error) {
        this.logger.error(`Signup error: ${error.message}`, error.stack);
      } else {
        this.logger.error('Signup error: Unknown error', JSON.stringify(error));
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.password) {
        throw new UnauthorizedException('Password not set for user');
      }

      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return {
        access_token: this.jwtService.sign(payload),
        expires_in: 3600, // 1 hour expiration
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(`Database error during login: ${error.message}`);
      }
      throw error; // Rethrow handled exceptions
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isStrongPassword(password: string): boolean {
    // Minimum 8 characters, at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }
}
