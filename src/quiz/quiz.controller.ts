import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Query,
  UseGuards,
  Patch,
  Delete,
  Param,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  UseInterceptors,
} from '@nestjs/common';
import {
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { Request } from 'express';
import { AddQuestionDto } from './dto/add-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Quiz')
@ApiBearerAuth()
@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  private readonly logger = new Logger(QuizController.name);

  constructor(private readonly quizService: QuizService) {}

  private getUserId(req: Request): string {
    const user = req.user;

    if (!user || typeof user !== 'object') {
      throw new BadRequestException('User not authenticated');
    }

    if (!('id' in user)) {
      throw new BadRequestException('User id not found');
    }

    const userWithId = user as { id: string | number };

    if (
      userWithId.id === undefined ||
      userWithId.id === null ||
      (typeof userWithId.id !== 'string' && typeof userWithId.id !== 'number')
    ) {
      throw new BadRequestException('User id is invalid');
    }

    return String(userWithId.id);
  }

  @Post()
  @ApiOperation({ summary: '📝 Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() dto: CreateQuizDto, @Req() req: Request) {
    try {
      const userId = this.getUserId(req);
      const createdQuiz = await this.quizService.createQuiz(dto, userId);
      // Fetch the quiz consistently from the primary after creation
      return await this.quizService.getQuizByIdConsistent(createdQuiz.id);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Create quiz failed: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Create quiz failed: ${String(error)}`);
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create quiz');
    }
  }

  @Post('question')
  @ApiOperation({ summary: '➕ Add a question to a quiz' })
  @ApiBody({ type: AddQuestionDto })
  @ApiResponse({ status: 201, description: 'Question added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addQuestion(@Body() dto: AddQuestionDto) {
    try {
      return await this.quizService.addQuestion(dto);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Add question failed: ${error.message}`, error.stack);
      }
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add question');
    }
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('all_quizzes')
  @CacheTTL(60) // Cache for 60 seconds
  @ApiOperation({
    summary: '📚 Get all quizzes (with optional filters and pagination)',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Language filter (e.g., en, hi)',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Comma-separated tags (e.g., insurance,investment)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({ status: 200, description: 'Quizzes retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('language') lang?: string,
    @Query('tags') tags?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    try {
      const tagArray = tags ? tags.split(',').map((tag) => tag.trim()) : [];
      return await this.quizService.getAllQuizzes(
        lang,
        tagArray,
        Number(page),
        Number(limit),
      );
    } catch (error) {
      this.logger.error(
        `Find all quizzes failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to retrieve quizzes');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '🔍 Get quiz by ID' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({ status: 200, description: 'Quiz retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id') id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid quiz ID format');
    }
    try {
      return await this.quizService.getQuizById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        this.logger.error(`Find quiz failed: ${error.message}`, error.stack);
      }
      throw new InternalServerErrorException('Failed to retrieve quiz');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: '✏️ Update quiz by ID' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiBody({ type: UpdateQuizDto })
  @ApiResponse({ status: 200, description: 'Quiz updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid quiz ID format');
    }
    try {
      return await this.quizService.updateQuiz(id, dto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        this.logger.error(`Update quiz failed: ${error.message}`, error.stack);
      }
      throw new InternalServerErrorException('Failed to update quiz');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: '🗑️ Delete quiz by ID' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({ status: 200, description: 'Quiz deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async delete(@Param('id') id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid quiz ID format');
    }
    try {
      return await this.quizService.deleteQuiz(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        this.logger.error(`Delete quiz failed: ${error.message}`, error.stack);
      }
      throw new InternalServerErrorException('Failed to delete quiz');
    }
  }

  @Post('submit')
  @ApiOperation({ summary: '📤 Submit quiz answers and score' })
  @ApiBody({ type: SubmitQuizDto })
  @ApiResponse({ status: 200, description: 'Quiz submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Client or quiz not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async submit(@Req() req: Request, @Body() dto: SubmitQuizDto) {
    try {
      const userId = this.getUserId(req);
      return await this.quizService.submitQuiz(userId, dto);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Submit quiz failed: ${error.message}`, error.stack);
      }
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to submit quiz');
    }
  }

  @Get('attempts/client')
  @ApiOperation({
    summary: '📈 Get all quiz attempts by current client (with pagination)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({ status: 200, description: 'Attempts retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async attempts(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    try {
      const userId = this.getUserId(req);
      return await this.quizService.getAttemptsByClient(
        userId,
        Number(page),
        Number(limit),
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Get attempts failed: ${error.message}`, error.stack);
      }
      throw new InternalServerErrorException(
        'Failed to retrieve quiz attempts',
      );
    }
  }

  @Get('suggestions/ai')
  @ApiOperation({
    summary: '🤖 Get AI-generated quiz suggestions for current client',
  })
  @ApiResponse({
    status: 200,
    description: 'Suggestions generated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid client ID' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSuggestionsFromAI(@Req() req: Request) {
    try {
      const userId = this.getUserId(req);
      return await this.quizService.getQuizSuggestionsFromAI(userId);
    } catch (error) {
      this.logger.error(
        `Get AI suggestions failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get AI quiz suggestions',
      );
    }
  }
}

