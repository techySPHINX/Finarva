import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ClientProfileDto } from '../../clients/dto/client-profile.dto'; 

export class AiInsuranceInputDto {
  @ApiProperty({ description: 'Unique identifier for the client' })
  @IsString()
  clientId!: string;

  @ApiPropertyOptional({ description: 'Age of the client', type: Number })
  @IsNumber()
  @IsOptional()
  age?: number;

  @ApiPropertyOptional({ description: 'Gender of the client', type: String })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Monthly income of the client',
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  monthlyIncome?: number;

  @ApiPropertyOptional({
    description: 'Existing insurance types',
    type: [String],
    example: ['life', 'health'],
  })
  @IsArray()
  @IsOptional()
  existingInsuranceTypes?: string[];

  @ApiPropertyOptional({
    description: 'Insurance goals',
    type: [String],
    example: ['family protection', 'hospitalization'],
  })
  @IsArray()
  @IsOptional()
  goals?: string[];

  @ApiPropertyOptional({
    description: 'Dependents of the client',
    type: [String],
    example: ['spouse', '2 children'],
  })
  @IsArray()
  @IsOptional()
  dependents?: string[];

  @ApiPropertyOptional({
    description: 'Location of the client',
    example: 'urban',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Occupation of the client' })
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiPropertyOptional({
    description: 'Health status of the client',
    example: 'diabetic',
  })
  @IsString()
  @IsOptional()
  healthStatus?: string;

  @ApiPropertyOptional({
    description: 'Preferred language for recommendations',
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({
    description: 'Profile of the client for suggesting insurance',
    type: ClientProfileDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ClientProfileDto)
  clientProfile!: ClientProfileDto;
}
