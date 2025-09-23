import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  findAll(@Body('userId') userId: string) {
    return this.loansService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loansService.update(id, updateLoanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loansService.remove(id);
  }

  @Get('client/:clientId')
  findAllByClientId(@Param('clientId') clientId: string) {
    return this.loansService.findAllByClientId(clientId);
  }

  @Get(':id/remaining-balance')
  getRemainingBalance(@Param('id') id: string) {
    return this.loansService.getRemainingBalance(id);
  }

  @Patch(':id/approve')
  approveLoan(@Param('id') id: string) {
    return this.loansService.approveLoan(id);
  }

  @Patch(':id/reject')
  rejectLoan(@Param('id') id: string) {
    return this.loansService.rejectLoan(id);
  }
}
