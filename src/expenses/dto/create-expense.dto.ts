
import { IsString, IsNumber, IsDate, IsNotEmpty } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsDate()
  @IsNotEmpty()
  date!: Date;

  @IsString()
  description!: string;
}
