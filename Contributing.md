# 🤝 Contributing to Finarva API

Thank you for your interest in contributing to Finarva! We welcome contributions from the community and are grateful for your support.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project adheres to a code of conduct that promotes a welcoming and inclusive environment. By participating, you agree to uphold this standard.

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Inclusive**: Welcome newcomers and help them get started
- **Be Collaborative**: Work together towards common goals
- **Be Patient**: Help others learn and grow
- **Be Professional**: Maintain professional communication

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** (v18+ recommended)
- **PostgreSQL** (v14+)
- **Redis** (v6+)
- **Docker** (optional, for containerized development)
- **Git** for version control

### Fork and Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/yourusername/Finarva.git
   cd Finarva
   ```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# See .env.example for all required variables
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 4. Start Development Server

```bash
# Development mode with hot reload
npm run start:dev

# Debug mode
npm run start:debug
```

## 📝 Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

- 🐛 **Bug Fixes**: Fix issues and improve stability
- ✨ **Features**: Add new functionality
- 📚 **Documentation**: Improve or add documentation
- 🧪 **Tests**: Add or improve test coverage
- 🔧 **Refactoring**: Improve code quality
- 🎨 **UI/UX**: Enhance user experience

### Before You Start

1. **Check existing issues** to avoid duplicate work
2. **Create an issue** for new features or significant changes
3. **Discuss your approach** in the issue comments
4. **Get approval** from maintainers for large changes

## 🔄 Pull Request Process

### 1. Create a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 2. Make Changes

- Follow our [coding standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 3. Commit Guidelines

We follow [Conventional Commits](https://conventionalcommits.org/):

```bash
# Format: type(scope): description
git commit -m "feat(auth): add JWT refresh token functionality"
git commit -m "fix(api): resolve CORS configuration issue"
git commit -m "docs(readme): update installation instructions"
```

**Commit Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/dependency updates

### 4. Push and Create PR

```bash
# Push your branch
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:

- **Clear title** describing the change
- **Detailed description** of what was changed and why
- **Links to related issues**
- **Screenshots** (if UI changes)
- **Testing instructions**

## 🎯 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Use explicit types
interface UserCreateDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ✅ Good: Use descriptive names
const calculateMonthlyInterestRate = (annualRate: number): number => {
  return annualRate / 12;
};

// ❌ Avoid: Implicit any types
const processData = (data: any) => { ... };
```

### NestJS Best Practices

```typescript
// ✅ Good: Use dependency injection
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}
}

// ✅ Good: Use DTOs for validation
@Post()
async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
  return this.userService.create(createUserDto);
}
```

### File Naming Conventions

- **Controllers**: `user.controller.ts`
- **Services**: `user.service.ts`
- **DTOs**: `create-user.dto.ts`
- **Entities**: `user.entity.ts`
- **Modules**: `user.module.ts`
- **Tests**: `user.service.spec.ts`

## 🧪 Testing Guidelines

### Unit Tests

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: MockType<UserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  it('should create user successfully', async () => {
    // Test implementation
  });
});
```

### E2E Tests

```typescript
describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);
  });
});
```

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Calculates the compound interest for an investment
 * @param principal - Initial investment amount
 * @param rate - Annual interest rate (as decimal)
 * @param time - Investment period in years
 * @param frequency - Compounding frequency per year
 * @returns The final amount after compound interest
 */
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  time: number,
  frequency: number,
): number {
  return principal * Math.pow(1 + rate / frequency, frequency * time);
}
```

### API Documentation

We use Swagger/OpenAPI for API documentation:

```typescript
@ApiOperation({ summary: 'Create a new user account' })
@ApiResponse({ status: 201, description: 'User created successfully' })
@ApiResponse({ status: 400, description: 'Invalid input data' })
@Post()
async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
  return this.userService.create(createUserDto);
}
```

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment**: OS, Node.js version, database version
- **Steps to reproduce**: Clear, step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happened
- **Error messages**: Full error logs
- **Screenshots**: If applicable

## 💡 Feature Requests

For feature requests, please provide:

- **Problem description**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches you've thought about
- **Additional context**: Any other relevant information

## 🏷️ Issue Labels

We use the following labels to categorize issues:

- `bug`: Something isn't working
- `enhancement`: New feature request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority-high`: High priority issues
- `priority-low`: Low priority issues

## 📞 Getting Help

If you need help:

1. **Check the documentation** first
2. **Search existing issues** for similar problems
3. **Ask in discussions** for general questions
4. **Create an issue** for specific problems

## 🙏 Recognition

We appreciate all contributions and will:

- **Acknowledge contributors** in release notes
- **Add you to the contributors list**
- **Provide feedback** on your contributions
- **Help you grow** as a developer

Thank you for contributing to Finarva! 🚀
