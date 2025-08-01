
import { PartialType } from '@nestjs/mapped-types';
import { CreateMerchantAssistantDto } from './create-merchant-assistant.dto';

export class UpdateMerchantAssistantDto extends PartialType(CreateMerchantAssistantDto) {}
