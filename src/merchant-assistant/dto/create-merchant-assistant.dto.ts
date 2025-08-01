import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMerchantAssistantDto {
  @IsString()
  @IsNotEmpty()
  merchantId!: string;

  @IsString()
  @IsNotEmpty()
  query!: string;
}