import { ApiProperty } from '@nestjs/swagger';

export class InvestmentSummaryDto {
  @ApiProperty({ description: 'Total amount invested by the client' })
  totalInvested!: number;

  @ApiProperty({ description: 'Total returns earned from investments' })
  totalReturns!: number;

  @ApiProperty({ description: 'Number of active investments' })
  activeInvestments!: number;

  @ApiProperty({ description: 'Number of matured investments' })
  maturedInvestments!: number;
}
