import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import { AiInsuranceInputDto } from './dto/ai-insurance-input.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Insurance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new insurance entry' })
  @ApiBody({ type: CreateInsuranceDto })
  @ApiResponse({ status: 201, description: 'Insurance created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Conflict with existing data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() dto: CreateInsuranceDto) {
    try {
      return await this.insuranceService.create(dto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Failed to create insurance');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all insurance entries' })
  @ApiResponse({ status: 200, description: 'Insurance entries retrieved' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll() {
    try {
      return await this.insuranceService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve insurance entries',
      );
    }
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get all insurance entries for a client' })
  @ApiParam({ name: 'clientId', example: 'clxyz123' })
  @ApiResponse({
    status: 200,
    description: 'Client insurance entries retrieved',
  })
  @ApiResponse({ status: 400, description: 'Invalid client ID format' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findByClient(@Param('clientId') clientId: string) {
    if (!clientId || typeof clientId !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }
    try {
      return await this.insuranceService.findAllByClient(clientId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        'Failed to retrieve client insurance entries',
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific insurance entry by ID' })
  @ApiResponse({ status: 200, description: 'Insurance entry retrieved' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Insurance entry not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id') id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid ID format');
    }
    try {
      return await this.insuranceService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        'Failed to retrieve insurance entry',
      );
    }
  }

  @Post('update/:id')
  @ApiOperation({ summary: 'Update insurance entry by ID' })
  @ApiResponse({ status: 200, description: 'Insurance updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Insurance entry not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(@Param('id') id: string, @Body() dto: UpdateInsuranceDto) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid ID format');
    }
    try {
      return await this.insuranceService.update(id, dto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Failed to update insurance');
    }
  }

  @Post('suggest')
  @ApiOperation({ summary: 'Get AI-powered insurance suggestions' })
  @ApiBody({ type: AiInsuranceInputDto })
  @ApiResponse({ status: 200, description: 'Suggestions generated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async suggestInsurance(@Body() dto: AiInsuranceInputDto) {
    try {
      return await this.insuranceService.suggestInsurance(dto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to generate suggestions');
    }
  }
}
