import { ApiProperty } from '@nestjs/swagger';

export class ClientProfileDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() phone!: string;
  @ApiProperty() language!: string;
  @ApiProperty({ required: false }) age?: number;
  @ApiProperty({ required: false }) gender?: string;
  @ApiProperty({ required: false }) income?: number;
  @ApiProperty({ type: [String] }) goals!: string[];
  @ApiProperty() agentId!: string;
}
