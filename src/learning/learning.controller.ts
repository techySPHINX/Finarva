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
import { LearningService } from './learning.service';
import { CreateLearningContentDto } from './dto/create-learning-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { RecordProgressDto } from './dto/record-progress.dto';

@ApiTags('Learning Content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Post()
  @ApiOperation({ summary: 'Upload learning content (video, audio, PDF)' })
  @ApiResponse({
    status: 201,
    description: 'Learning content created successfully',
  })
  @ApiBody({ type: CreateLearningContentDto })
  create(
    @Body() dto: CreateLearningContentDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.learningService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all learning content (filterable)' })
  @ApiQuery({ name: 'language', required: false, example: 'hi' })
  @ApiQuery({ name: 'tags', required: false, example: 'insurance,investment' })
  @ApiResponse({ status: 200, description: 'List of learning content' })
  findAll(@Query('language') language?: string, @Query('tags') tags?: string) {
    const tagArray = tags ? tags.split(',') : [];
    return this.learningService.findAll(language, tagArray);
  }

  @Get('client-profile')
  @ApiOperation({
    summary: 'Fetch personalized content based on client profile',
  })
  @ApiQuery({ name: 'language', required: false, example: 'en' })
  @ApiQuery({ name: 'goals', required: false, example: 'retirement,education' })
  @ApiQuery({ name: 'income', required: false, example: '20000' })
  findByClientProfile(
    @Query('language') language?: string,
    @Query('goals') goals?: string,
    @Query('occupation') occupation?: string,
    @Query('investmentExperience') investmentExperience?: string,
  ) {
    const profile: {
      preferredLanguage?: string;
      goals?: string[];
      occupation?: string;
      investmentExperience?: string;
    } = {
      preferredLanguage: language,
      goals: goals ? goals.split(',') : undefined,
      occupation,
      investmentExperience,
    };
    return this.learningService.findByClientProfile(profile);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single learning content item by ID' })
  @ApiResponse({ status: 200, description: 'Single learning item details' })
  findOne(@Param('id') id: string) {
    return this.learningService.findOne(id);
  }

  @Post(':id/progress')
  @ApiOperation({ summary: 'Record client progress on a learning item' })
  @ApiBody({ type: RecordProgressDto })
  @ApiResponse({
    status: 200,
    description: 'Progress recorded/updated successfully',
  })
  recordProgress(
    @Param('id') contentId: string,
    @Body() dto: RecordProgressDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.learningService.recordProgress(req.user.id, dto);
  }
}
