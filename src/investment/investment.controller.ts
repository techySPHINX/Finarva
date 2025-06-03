import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  Query,
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
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new investment' })
  @ApiBody({ type: CreateInvestmentDto })
  @ApiResponse({ status: 201, description: 'The investment has been created.' })
  create(@Body() dto: CreateInvestmentDto) {
    return this.investmentService.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple investments in bulk' })
  @ApiBody({ type: BulkCreateInvestmentDto })
  @ApiResponse({ status: 201, description: 'Bulk investments created.' })
  bulkCreate(@Body() dto: BulkCreateInvestmentDto) {
    return this.investmentService.bulkCreate(dto);
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
  findAllByClient(
    @Param('clientId') clientId: string,
    @Query('status') status?: string,
  ) {
    return this.investmentService.findAllByClient(clientId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get investment by ID' })
  @ApiParam({ name: 'id', description: 'The investment ID' })
  @ApiResponse({ status: 200, description: 'The investment record.' })
  findOne(@Param('id') id: string) {
    return this.investmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update investment by ID' })
  @ApiParam({ name: 'id', description: 'The investment ID' })
  @ApiBody({ type: UpdateInvestmentDto })
  @ApiResponse({ status: 200, description: 'The updated investment.' })
  update(@Param('id') id: string, @Body() dto: UpdateInvestmentDto) {
    return this.investmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete investment by ID' })
  @ApiParam({ name: 'id', description: 'The investment ID' })
  @ApiResponse({ status: 200, description: 'The deleted investment.' })
  remove(@Param('id') id: string) {
    return this.investmentService.remove(id);
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
  findByClientAndTypes(
    @Param('clientId') clientId: string,
    @Query('types') types: string ,
  ) {
    const typeList = types?.split(',') || [];
    return this.investmentService.findByClientAndTypes(clientId, typeList);
  }
}
