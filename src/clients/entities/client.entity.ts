import { ApiProperty } from '@nestjs/swagger';

export class ClientEntity {
  @ApiProperty() id: string | undefined;
  @ApiProperty() name!: string;
  @ApiProperty() phone!: string;
  @ApiProperty() language!: string;
  @ApiProperty({ required: false }) age?: number;
  @ApiProperty({ required: false }) gender?: string;
  @ApiProperty({ required: false }) income?: number;
  @ApiProperty({ type: [String] }) goals!: string[];
  @ApiProperty() createdAt!: Date;
  @ApiProperty() agentId!: string;
}
