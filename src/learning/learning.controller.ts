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
import { CreateLearningDto } from './dto/create-learning.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Learning Content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Post()
  @ApiOperation({ summary: 'Upload learning content (video, audio, PDF)' })
  @ApiResponse({ status: 201, description: 'Learning content created successfully' })
  @ApiBody({ type: CreateLearningDto })
  create(@Body() dto: CreateLearningDto, @Req() req: any) {
    return this.learningService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all learning content (filterable)' })
  @ApiQuery({ name: 'language', required: false, example: 'hi' })
  @ApiQuery({ name: 'tags', required: false, example: 'insurance,investment' })
  @ApiResponse({ status: 200, description: 'List of learning content' })
  findAll(
    @Query('language') language?: string,
    @Query('tags') tags?: string,
  ) {
    const tagArray = tags ? tags.split(',') : [];
    return this.learningService.findAll(language, tagArray);
  }

  @Get('client-profile')
  @ApiOperation({ summary: 'Fetch personalized content based on client profile' })
  @ApiQuery({ name: 'language', required: false, example: 'en' })
  @ApiQuery({ name: 'goals', required: false, example: 'retirement,education' })
  @ApiQuery({ name: 'income', required: false, example: '20000' })
  findByClientProfile(@Query() profile: any) {
    return this.learningService.findByClientProfile(profile);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single learning content item by ID' })
  @ApiResponse({ status: 200, description: 'Single learning item details' })
  findOne(@Param('id') id: string) {
    return this.learningService.findOne(id);
  }
}
