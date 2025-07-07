import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { BulkCreateInvestmentDto } from './dto/bulk-create-investment.dto';

@Injectable()
export class InvestmentService {
  private readonly logger = new Logger(InvestmentService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: CreateInvestmentDto) {
    try {
      return await this.prisma.investment.create({ data });
    } catch (error) {
      // Handle known error codes regardless of error type
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Duplicate investment entry');
        } else if (error.code === 'P2003') {
          throw new BadRequestException('Invalid foreign key reference');
        }
      }

      this.logger.error(
        `Create investment failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to create investment');
    }
  }

  async bulkCreate(dto: BulkCreateInvestmentDto) {
    if (!dto || !dto.investments || !Array.isArray(dto.investments)) {
      throw new BadRequestException('Invalid investments data');
    }

    try {
      const createPromises = dto.investments.map((investment) =>
        this.prisma.investment.create({ data: investment }),
      );
      return await Promise.all(createPromises);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Bulk create failed: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Bulk create failed: ${String(error)}`);
      }
      throw new InternalServerErrorException(
        'Failed to create bulk investments',
      );
    }
  }

  async findAllByClient(clientId: string, status?: string) {
    if (!clientId || typeof clientId !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }

    try {
      return await this.prisma.investment.findMany({
        where: {
          clientId,
          status: status || undefined,
        },
      });
    } catch (error) {
      this.logger.error(
        `Find all by client failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to retrieve investments');
    }
  }

  async findOne(id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid investment ID format');
    }

    try {
      const investment = await this.prisma.investment.findUnique({
        where: { id },
      });
      if (!investment) {
        throw new NotFoundException(`Investment with id ${id} not found`);
      }
      return investment;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof Error) {
        this.logger.error(`Find one failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('Find one failed: Unknown error');
      }
      throw new InternalServerErrorException('Failed to retrieve investment');
    }
  }

  async update(id: string, data: UpdateInvestmentDto) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid investment ID format');
    }

    try {
      return await this.prisma.investment.update({ where: { id }, data });
    } catch (error) {
      // Handle known error codes regardless of error type
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Investment with id ${id} not found`);
        } else if (error.code === 'P2002') {
          throw new BadRequestException('Duplicate investment entry');
        }
      }

      if (error instanceof Error) {
        this.logger.error(`Update failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('Update failed: Unknown error');
      }
      throw new InternalServerErrorException('Failed to update investment');
    }
  }

  async remove(id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid investment ID format');
    }

    try {
      return await this.prisma.investment.delete({ where: { id } });
    } catch (error) {
      // Handle known error codes regardless of error type
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Investment with id ${id} not found`);
        }
      }

      if (error instanceof Error) {
        this.logger.error(`Remove failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('Remove failed: Unknown error');
      }
      throw new InternalServerErrorException('Failed to delete investment');
    }
  }

  async findByClientAndTypes(clientId: string, types: string[]) {
    if (!clientId || typeof clientId !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }
    if (!types || !Array.isArray(types) || types.length === 0) {
      throw new BadRequestException('Types array cannot be empty');
    }

    try {
      return await this.prisma.investment.findMany({
        where: {
          clientId,
          type: { in: types },
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Find by client and types failed: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Find by client and types failed: Unknown error');
      }
      throw new InternalServerErrorException(
        'Failed to retrieve filtered investments',
      );
    }
  }
}
