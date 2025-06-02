import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvestmentStatusDto {
  @ApiProperty({ description: 'Unique identifier of the investment' })
  @IsString()
  investmentId!: string;

  @ApiProperty({
    description:
      'New status of the investment (e.g., active, matured, withdrawn)',
  })
  @IsString()
  status!: string;

  @ApiPropertyOptional({
    description: 'Optional remarks or comments about the status change',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
