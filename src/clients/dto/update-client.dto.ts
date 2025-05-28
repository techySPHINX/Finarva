import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClientDto extends PartialType(CreateClientDto) {
 @ApiPropertyOptional({ description: 'Client name', example: 'John Doe' })
 name?: string;

 @ApiPropertyOptional({ description: 'Client email', example: 'john@example.com' })
 email?: string;

 @ApiPropertyOptional({ description: 'Client phone number', example: '+1234567890' })
 phone?: string;
}
