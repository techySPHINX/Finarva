import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from '../ai/ai.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Clients')
@ApiBearerAuth('access-token') 
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly aiService: AiService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  async create(@Body() dto: CreateClientDto, @Req() req: any) {
    const agentId = req.user.id;
    return this.clientsService.create(dto, agentId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients for authenticated agent' })
  @ApiResponse({ status: 200, description: 'List of clients for the agent' })
  async findAll(@Req() req: any) {
    return this.clientsService.findAllByAgent(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Client details' })
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }

  @Get(':id/insights')
@ApiOperation({ summary: 'Get AI-generated insights for a client' })
@ApiParam({ name: 'id', description: 'Client ID' })
@ApiResponse({ status: 200, description: 'AI insights generated successfully' })
async getClientAiInsights(@Param('id') id: string) {
  const client = await this.clientsService.findOne(id);

  if (!client) {
    throw new NotFoundException('Client not found');
  }

  const profile = {
    id: client.id,
    name: client.name,
    phone: client.phone,
    agentId: client.agentId,
    language: client.preferredLanguage ?? 'en',
    goals: client.goals ?? [],
  };

  return this.aiService.analyzeProfile(profile);
}

}
