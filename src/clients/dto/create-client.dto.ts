import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'Ramesh Kumar' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'Hindi' })
  @IsString()
  language!: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiPropertyOptional({ example: 'male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 25000 })
  @IsOptional()
  @IsNumber()
  income?: number;

  @ApiPropertyOptional({ example: ['retirement', 'education'] })
  @IsOptional()
  @IsArray()
  goals?: string[];
}
