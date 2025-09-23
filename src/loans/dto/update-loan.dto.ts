import { PartialType } from '@nestjs/mapped-types';
import { CreateLoanDto } from './create-loan.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { LoanStatus } from '../enums/loan-status.enum';

export class UpdateLoanDto extends PartialType(CreateLoanDto) {
    @IsEnum(LoanStatus)
    @IsOptional()
    status?: LoanStatus;
}