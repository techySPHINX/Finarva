import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateInsuranceDto } from './create-insurance.dto';
import { ApiProperty } from '@nestjs/swagger';

export class BulkCreateInsuranceDto {
  @ApiProperty({
    type: [CreateInsuranceDto],
    description: 'Array of insurance objects to create',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateInsuranceDto)
  insurances!: CreateInsuranceDto[];
}
