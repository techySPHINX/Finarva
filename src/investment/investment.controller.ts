import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Investments')
@Controller('investments')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new investment' })
  @ApiBody({ type: CreateInvestmentDto })
  @ApiResponse({ status: 201, description: 'Investment successfully created' })
  create(@Body() dto: CreateInvestmentDto) {
    return this.investmentService.create(dto);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get all investments for a specific client' })
  @ApiParam({ name: 'clientId', description: 'ID of the client' })
  @ApiResponse({ status: 200, description: 'List of client investments' })
  findAllByClient(@Param('clientId') clientId: string) {
    return this.investmentService.findAllByClient(clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific investment by ID' })
  @ApiParam({ name: 'id', description: 'Investment ID' })
  @ApiResponse({ status: 200, description: 'Investment details' })
  findOne(@Param('id') id: string) {
    return this.investmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an investment by ID' })
  @ApiParam({ name: 'id', description: 'Investment ID' })
  @ApiBody({ type: UpdateInvestmentDto })
  @ApiResponse({ status: 200, description: 'Investment updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateInvestmentDto) {
    return this.investmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an investment by ID' })
  @ApiParam({ name: 'id', description: 'Investment ID' })
  @ApiResponse({ status: 200, description: 'Investment removed successfully' })
  remove(@Param('id') id: string) {
    return this.investmentService.remove(id);
  }
}
