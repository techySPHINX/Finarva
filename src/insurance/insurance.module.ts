import { Module } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { InsuranceController } from './insurance.controller';

@Module({
  providers: [InsuranceService],
  controllers: [InsuranceController]
})
export class InsuranceModule {}
