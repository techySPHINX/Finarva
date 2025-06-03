import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),  
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call signup with correct parameters', async () => {
    const dto: SignupDto = { email: 'test@example.com', password: 'password' };
    const result = {
      message: 'User registered',
      user: { id: '1', email: dto.email },
    };
    mockAuthService.signup.mockResolvedValue(result);

    expect(await controller.signup(dto)).toEqual(result);
    expect(mockAuthService.signup).toHaveBeenCalledWith(
      dto.email,
      dto.password,
    );
  });

  it('should call login with correct parameters', async () => {
    const dto: LoginDto = { email: 'test@example.com', password: 'password' };
    const token = { access_token: 'jwt.token.here' };
    mockAuthService.login.mockResolvedValue(token);

    expect(await controller.login(dto)).toEqual(token);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto.email, dto.password);
  });
});
