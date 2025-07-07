import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { InvestmentService } from './investment.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { BulkCreateInvestmentDto } from './dto/bulk-create-investment.dto';

@ApiTags('Investments')
@Controller('investments')
export class InvestmentController {
  private readonly logger = new Logger(InvestmentController.name);

  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new investment' })
  @ApiBody({ type: CreateInvestmentDto })
  @ApiResponse({ status: 201, description: 'The investment has been created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() dto: CreateInvestmentDto) {
    try {
      return await this.investmentService.create(dto);
    } catch (error) {
      this.logger.error(
        `Create investment failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Failed to create investment');
    }
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple investments in bulk' })
  @ApiBody({ type: BulkCreateInvestmentDto })
  @ApiResponse({ status: 201, description: 'Bulk investments created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async bulkCreate(@Body() dto: BulkCreateInvestmentDto) {
    try {
      if (!dto || !dto.investments || !Array.isArray(dto.investments)) {
        throw new BadRequestException('Invalid investments data');
      }
      return await this.investmentService.bulkCreate(dto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const err = error as Error;
      this.logger.error(`Bulk create failed: ${err.message}`, err.stack);
      throw new InternalServerErrorException(
        'Failed to create bulk investments',
      );
    }
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Find all investments by a client ID' })
  @ApiParam({ name: 'clientId', description: 'The client ID' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Optional investment status filter',
  })
  @ApiResponse({
    status: 200,
    description: 'List of investments for the client.',
  })
  @ApiResponse({ status: 400, description: 'Invalid client ID format' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAllByClient(
    @Param('clientId') clientId: string,
    @Query('status') status?: string,
  ) {
    if (!clientId || typeof clientId !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }
    try {
      return await this.investmentService.findAllByClient(clientId, status);
    } catch (error) {
      this.logger.error(
        `Find all by client failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Failed to retrieve investments');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get investment by ID' })
  @ApiParam({ name: 'id', description: 'The investment ID' })
  @ApiResponse({ status: 200, description: 'The investment record.' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Investment not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id') id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid investment ID format');
    }
    try {
      return await this.investmentService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`Find one failed: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to retrieve investment');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update investment by ID' })
  @ApiParam({ name: 'id', description: 'The investment ID' })
  @ApiBody({ type: UpdateInvestmentDto })
  @ApiResponse({ status: 200, description: 'The updated investment.' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Investment not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(@Param('id') id: string, @Body() dto: UpdateInvestmentDto) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid investment ID format');
    }
    try {
      return await this.investmentService.update(id, dto);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Update failed: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to update investment');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete investment by ID' })
  @ApiParam({ name: 'id', description: 'The investment ID' })
  @ApiResponse({ status: 200, description: 'The deleted investment.' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Investment not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id') id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid investment ID format');
    }
    try {
      return await this.investmentService.remove(id);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Remove failed: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to delete investment');
    }
  }

  @Get('client/:clientId/types')
  @ApiOperation({ summary: 'Find investments by client ID and types' })
  @ApiParam({ name: 'clientId', description: 'The client ID' })
  @ApiQuery({
    name: 'types',
    required: true,
    description: 'Comma-separated investment types',
  })
  @ApiResponse({ status: 200, description: 'Filtered investments.' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findByClientAndTypes(
    @Param('clientId') clientId: string,
    @Query('types') types: string,
  ) {
    if (!clientId || typeof clientId !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }
    if (!types || typeof types !== 'string') {
      throw new BadRequestException('Invalid types parameter');
    }

    const typeList = types
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (typeList.length === 0) {
      throw new BadRequestException('Types parameter cannot be empty');
    }

    try {
      return await this.investmentService.findByClientAndTypes(
        clientId,
        typeList,
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Find by client and types failed: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Find by client and types failed: Unknown error',
          ''
        );
      }
      throw new InternalServerErrorException(
        'Failed to retrieve filtered investments',
      );
    }
  }
}
