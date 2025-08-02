
import { IsString, IsNumber, IsDate, IsNotEmpty } from 'class-validator';

export class CreateLoanDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsNumber()
  @IsNotEmpty()
  interestRate!: number;

  @IsNumber()
  @IsNotEmpty()
  term!: number;

  @IsDate()
  @IsNotEmpty()
  startDate!: Date;

  @IsString()
  @IsNotEmpty()
  status!: string;
}
