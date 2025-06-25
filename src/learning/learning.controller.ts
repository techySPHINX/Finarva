import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  ConflictException,
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
  ApiParam,
} from '@nestjs/swagger';
import { RecordProgressDto } from './dto/record-progress.dto';

@ApiTags('Learning Content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('learning')
export class LearningController {
  private readonly logger = new Logger(LearningController.name);

  constructor(private readonly learningService: LearningService) {}

  @Post()
  @ApiOperation({ summary: 'Upload learning content (video, audio, PDF)' })
  @ApiResponse({
    status: 201,
    description: 'Learning content created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Content already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: CreateLearningContentDto })
  async create(
    @Body() dto: CreateLearningContentDto,
    @Req() req: { user: { id: string } },
  ) {
    try {
      return await this.learningService.create(dto, req.user.id);
    } catch (error) {
      this.logger.error(
        `Content creation failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create learning content',
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all learning content (filterable)' })
  @ApiQuery({ name: 'language', required: false, example: 'hi' })
  @ApiQuery({ name: 'tags', required: false, example: 'insurance,investment' })
  @ApiResponse({ status: 200, description: 'List of learning content' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('language') language?: string,
    @Query('tags') tags?: string,
  ) {
    try {
      const tagArray = tags ? tags.split(',').map((tag) => tag.trim()) : [];
      return await this.learningService.findAll(language, tagArray);
    } catch (error) {
      this.logger.error(
        `Content retrieval failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve learning content',
      );
    }
  }

  @Get('client-profile')
  @ApiOperation({
    summary: 'Fetch personalized content based on client profile',
  })
  @ApiQuery({ name: 'language', required: false, example: 'en' })
  @ApiQuery({ name: 'goals', required: false, example: 'retirement,education' })
  @ApiQuery({ name: 'occupation', required: false, example: 'farmer' })
  @ApiQuery({
    name: 'investmentExperience',
    required: false,
    example: 'beginner',
  })
  @ApiResponse({ status: 200, description: 'Personalized content list' })
  @ApiResponse({ status: 400, description: 'Invalid profile parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findByClientProfile(
    @Query('language') language?: string,
    @Query('goals') goals?: string,
    @Query('occupation') occupation?: string,
    @Query('investmentExperience') investmentExperience?: string,
  ) {
    try {
      const profile = {
        preferredLanguage: language,
        goals: goals ? goals.split(',').map((goal) => goal.trim()) : [],
        occupation,
        investmentExperience,
      };
      return await this.learningService.findByClientProfile(profile);
    } catch (error) {
      this.logger.error(
        `Profile-based search failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to find personalized content',
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single learning content item by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Single learning item details' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id') id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid content ID format');
    }
    try {
      return await this.learningService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Content retrieval failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to retrieve content');
    }
  }

  @Post(':id/progress')
  @ApiOperation({ summary: 'Record client progress on a learning item' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiBody({ type: RecordProgressDto })
  @ApiResponse({
    status: 200,
    description: 'Progress recorded/updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async recordProgress(
    @Param('id') contentId: string,
    @Body() dto: RecordProgressDto,
  ) {
    if (!contentId || typeof contentId !== 'string') {
      throw new BadRequestException('Invalid content ID format');
    }
    if (!dto.clientId || typeof dto.clientId !== 'string') {
      throw new BadRequestException('Invalid client ID');
    }
    if (
      dto.completion === undefined ||
      dto.completion < 0 ||
      dto.completion > 100
    ) {
      throw new BadRequestException('Completion must be between 0-100');
    }

    try {
      return await this.learningService.recordProgress(dto.clientId, {
        ...dto,
        contentId,
      });
    } catch (error) {
      const errMsg = (error as any)?.message || 'Unknown error';
      const errStack = (error as any)?.stack;
      this.logger.error(
        `Progress recording failed: ${errMsg}`,
        errStack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to record progress');
    }
  }
}
