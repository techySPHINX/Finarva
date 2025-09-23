
import { IsString, IsNumber, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { LoanStatus } from '../enums/loan-status.enum';

export class CreateLoanDto {
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsNumber()
  @IsNotEmpty()
  interestRate!: number;

  @IsNumber()
  @IsNotEmpty()
  term!: number;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsEnum(LoanStatus)
  @IsOptional()
  status?: LoanStatus;

  @IsString()
  @IsNotEmpty()
  clientId!: string;
}
