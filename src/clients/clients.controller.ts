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
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  Query,
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

import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Clients')
@ApiBearerAuth('access-token')
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  private readonly logger = new Logger(ClientsController.name);

  constructor(
    private readonly clientsService: ClientsService,
    private readonly aiService: AiService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(
    @Body() dto: CreateClientDto,
    @Req() req: { user: { id: string } },
  ) {
    try {
      const agentId = req.user.id;
      return await this.clientsService.create(dto, agentId);
    } catch (error) {
      this.logger.error(
        `Client creation failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to create client');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients for authenticated agent' })
  @ApiResponse({ status: 200, description: 'List of clients for the agent' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(@Req() req: { user: { id: string } }, @Query() paginationDto: PaginationDto) {
    try {
      return await this.clientsService.findAllByAgent(req.user.id, paginationDto);
    } catch (error) {
      this.logger.error(
        `Client retrieval failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to retrieve clients');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Client details' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }

    try {
      const client = await this.clientsService.findOne(id);
      // Ownership check
      if (client.agentId !== req.user.id) {
        throw new ForbiddenException('You do not have access to this client');
      }
      return client;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(
        `Client retrieval failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to retrieve client');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @Req() req: { user: { id: string } },
  ) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }

    try {
      // Verify ownership before update
      const client = await this.clientsService.findOne(id);
      if (client.agentId !== req.user.id) {
        throw new ForbiddenException('You do not have access to this client');
      }

      return await this.clientsService.update(id, dto);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      if (error instanceof Error) {
        this.logger.error(`Client update failed: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Client update failed: ${String(error)}`);
      }
      throw new InternalServerErrorException('Failed to update client');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }

    try {
      // Verify ownership before delete
      const client = await this.clientsService.findOne(id);
      if (client.agentId !== req.user.id) {
        throw new ForbiddenException('You do not have access to this client');
      }

      return await this.clientsService.remove(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(
        `Client deletion failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to delete client');
    }
  }

  @Get(':id/insights')
  @ApiOperation({ summary: 'Get AI-generated insights for a client' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'AI insights generated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getClientAiInsights(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }

    try {
      const client = await this.clientsService.findOne(id);

      // Ownership check
      if (client.agentId !== req.user.id) {
        throw new ForbiddenException('You do not have access to this client');
      }

      const profile = {
        id: client.id,
        name: client.name,
        phone: client.phone,
        agentId: client.agentId,
        language: client.preferredLanguage ?? 'en',
        goals: client.goals ?? [],
      };

      return await this.aiService.analyzeProfile(profile);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      if (error instanceof Error) {
        this.logger.error(`AI insights failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('AI insights failed: Unknown error', String(error));
      }
      throw new InternalServerErrorException('Failed to generate insights');
    }
  }
}
