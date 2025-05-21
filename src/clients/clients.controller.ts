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
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Clients')
@ApiBearerAuth() // Enables JWT auth input in Swagger UI
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}
  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  @ApiBody({ type: CreateClientDto })
  async create(@Body() dto: CreateClientDto, @Req() req: any) {
    const agentId = req.user.id;
    return await this.clientsService.create(dto, agentId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients for logged-in agent' })
  @ApiResponse({ status: 200, description: 'List of clients' })
  async findAll(@Req() req: any) {
    return await this.clientsService.findAllByAgent(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single client by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Client found' })
  async findOne(@Param('id') id: string) {
    return await this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Client updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return await this.clientsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Client deleted' })
  async remove(@Param('id') id: string) {
    return await this.clientsService.remove(id);
  }
}
