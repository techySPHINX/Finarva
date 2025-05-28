// src/insurance/insurance.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
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
  create(@Body() dto: CreateInsuranceDto) {
    return this.insuranceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all insurance entries' })
  findAll() {
    return this.insuranceService.findAll();
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get all insurance entries for a client' })
  @ApiParam({ name: 'clientId', example: 'clxyz123' })
  findByClient(@Param('clientId') clientId: string) {
    return this.insuranceService.findAllByClient(clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific insurance entry by ID' })
  findOne(@Param('id') id: string) {
    return this.insuranceService.findOne(id);
  }

  @Post('update/:id')
  @ApiOperation({ summary: 'Update insurance entry by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateInsuranceDto) {
    return this.insuranceService.update(id, dto);
  }

  @Post('suggest')
  @ApiOperation({ summary: 'Get AI-powered insurance suggestions' })
  @ApiBody({ type: AiInsuranceInputDto })
  suggestInsurance(@Body() dto: AiInsuranceInputDto) {
    return this.insuranceService.suggestInsurance(dto);
  }
}
