import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { AddQuestionDto } from './dto/add-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
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

  @Post()
  @ApiOperation({ summary: '📝 Create a new quiz' })
  @ApiBody({ type: CreateQuizDto })
  create(@Body() dto: CreateQuizDto, @Req() req: any) {
    return this.quizService.createQuiz(dto, req.user.id);
  }

  @Post('question')
  @ApiOperation({ summary: '➕ Add a question to a quiz' })
  @ApiBody({ type: AddQuestionDto })
  addQuestion(@Body() dto: AddQuestionDto) {
    return this.quizService.addQuestion(dto);
  }

  @Get()
  @ApiOperation({ summary: '📚 Get all quizzes (with optional filters)' })
  @ApiQuery({ name: 'language', required: false, description: 'Language filter (e.g., en, hi)' })
  @ApiQuery({ name: 'tags', required: false, description: 'Comma-separated tags (e.g., insurance,investment)' })
  findAll(@Query('language') lang?: string, @Query('tags') tags?: string) {
    const tagArray = tags ? tags.split(',') : [];
    return this.quizService.getAllQuizzes(lang, tagArray);
  }

  @Get(':id')
  @ApiOperation({ summary: '🔍 Get quiz by ID' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  findOne(@Param('id') id: string) {
    return this.quizService.getQuizById(id);
  }

  @Post('submit')
  @ApiOperation({ summary: '📤 Submit quiz answers and score' })
  @ApiBody({ type: SubmitQuizDto })
  submit(@Req() req: any, @Body() dto: SubmitQuizDto) {
    return this.quizService.submitQuiz(req.user.id, dto);
  }

  @Get('attempts/client')
  @ApiOperation({ summary: '📈 Get all quiz attempts by current client' })
  attempts(@Req() req: any) {
    return this.quizService.getAttemptsByClient(req.user.id);
  }
}
