
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class CalculateTaxDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  income: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  expenses: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  year: number;
}
