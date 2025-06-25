import {
  Controller,
  Post,
  Body,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'User Signup' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: SignupDto })
  async signup(@Body() dto: SignupDto) {
    try {
      return await this.authService.signup(dto.email, dto.password);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof Error) {
        this.logger.error(`Signup failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('Signup failed: Unknown error', '');
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authService.login(dto.email, dto.password);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      if (error instanceof Error) {
        this.logger.error(`Login failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('Login failed: Unknown error', '');
      }
      throw new InternalServerErrorException('Authentication failed');
    }
  }
}
