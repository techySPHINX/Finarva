import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateInsuranceDto } from './create-insurance.dto';

export class UpdateInsuranceDto extends PartialType(CreateInsuranceDto) {
 @ApiPropertyOptional({ description: 'The name of the insurance' })
 name?: string;

 @ApiPropertyOptional({ description: 'The type of the insurance' })
 type?: string;

 @ApiPropertyOptional({ description: 'The premium amount' })
 premium?: number;

}
