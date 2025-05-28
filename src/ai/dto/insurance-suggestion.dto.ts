import { IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClientProfileDto } from '../../clients/dto/client-profile.dto';

export class InsuranceSuggestionDto {
  @ApiProperty({ type: () => ClientProfileDto })
  @IsNotEmpty()
  @IsObject()
  clientProfile!: ClientProfileDto;
}
