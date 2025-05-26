export class InvestmentResponseDto {
  id!: string;
  clientId!: string;
  type!: string;
  amount!: number;
  startDate!: Date;
  status!: string;
  returns?: number;
  source?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
