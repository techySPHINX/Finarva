import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'User Signup' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBody({ type: SignupDto })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.email, dto.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
