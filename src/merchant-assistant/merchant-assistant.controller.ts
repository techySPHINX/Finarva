
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MerchantAssistantService } from './merchant-assistant.service';
import { CreateMerchantAssistantDto } from './dto/create-merchant-assistant.dto';
import { UpdateMerchantAssistantDto } from './dto/update-merchant-assistant.dto';

@Controller('merchant-assistant')
export class MerchantAssistantController {
  constructor(private readonly merchantAssistantService: MerchantAssistantService) {}

  @Post()
  create(@Body() createMerchantAssistantDto: CreateMerchantAssistantDto) {
    return this.merchantAssistantService.create(createMerchantAssistantDto);
  }

  @Get()
  findAll() {
    return this.merchantAssistantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.merchantAssistantService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMerchantAssistantDto: UpdateMerchantAssistantDto) {
    return this.merchantAssistantService.update(+id, updateMerchantAssistantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.merchantAssistantService.remove(+id);
  }
}
