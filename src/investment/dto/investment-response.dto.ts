import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvestmentResponseDto {
  @ApiProperty({ description: 'Unique identifier for the investment' })
  id!: string;

  @ApiProperty({ description: 'ID of the client who made the investment' })
  clientId!: string;

  @ApiProperty({
    description: 'Type of investment (e.g., mutual fund, stock, etc.)',
  })
  type!: string;

  @ApiProperty({ description: 'Amount invested' })
  amount!: number;

  @ApiProperty({
    description: 'Start date of the investment',
    type: String,
    format: 'date-time',
  })
  startDate!: Date;

  @ApiProperty({
    description: 'Current status of the investment (e.g., active, closed)',
  })
  status!: string;

  @ApiPropertyOptional({ description: 'Returns generated from the investment' })
  returns?: number;

  @ApiPropertyOptional({ description: 'Source or platform of the investment' })
  source?: string;

  @ApiProperty({
    description: 'Timestamp when the investment was created',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when the investment was last updated',
    type: String,
    format: 'date-time',
  })
  updatedAt!: Date;
}
