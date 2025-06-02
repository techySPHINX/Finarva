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
} from '@nestjs/common';
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
} from '@nestjs/swagger';

@ApiTags('Quiz')
@ApiBearerAuth()
@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  private getUserId(req: Request): string {
    const user = req.user;

    if (!user || typeof user !== 'object') {
      throw new Error('User not authenticated');
    }

    if (!('id' in user)) {
      throw new Error('User id not found');
    }

    const userWithId = user as { id: string | number };

    if (
      userWithId.id === undefined ||
      userWithId.id === null ||
      (typeof userWithId.id !== 'string' && typeof userWithId.id !== 'number')
    ) {
      throw new Error('User id is invalid');
    }

    return String(userWithId.id);
  }

  @Post()
  @ApiOperation({ summary: '📝 Create a new quiz' })
  async create(@Body() dto: CreateQuizDto, @Req() req: Request) {
    const userId = this.getUserId(req);
    return await this.quizService.createQuiz(dto, userId);
  }

  @Post('question')
  @ApiOperation({ summary: '➕ Add a question to a quiz' })
  @ApiBody({ type: AddQuestionDto })
  async addQuestion(@Body() dto: AddQuestionDto) {
    return await this.quizService.addQuestion(dto);
  }

  @Get()
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
  async findAll(
    @Query('language') lang?: string,
    @Query('tags') tags?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const tagArray = tags ? tags.split(',').map((tag) => tag.trim()) : [];
    return await this.quizService.getAllQuizzes(
      lang,
      tagArray,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '🔍 Get quiz by ID' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  async findOne(@Param('id') id: string) {
    return await this.quizService.getQuizById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '✏️ Update quiz by ID' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiBody({ type: UpdateQuizDto })
  async update(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
    return await this.quizService.updateQuiz(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '🗑️ Delete quiz by ID' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  async delete(@Param('id') id: string) {
    return await this.quizService.deleteQuiz(id);
  }

  @Post('submit')
  @ApiOperation({ summary: '📤 Submit quiz answers and score' })
  @ApiBody({ type: SubmitQuizDto })
  async submit(@Req() req: Request, @Body() dto: SubmitQuizDto) {
    const userId = this.getUserId(req);
    return await this.quizService.submitQuiz(userId, dto);
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
  async attempts(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const userId = this.getUserId(req);
    return await this.quizService.getAttemptsByClient(
      userId,
      Number(page),
      Number(limit),
    );
  }

  @Get('suggestions/ai')
  @ApiOperation({
    summary: '🤖 Get AI-generated quiz suggestions for current client',
  })
  async getSuggestionsFromAI(@Req() req: Request) {
    const userId = this.getUserId(req);
    return await this.quizService.getQuizSuggestionsFromAI(userId);
  }
}
