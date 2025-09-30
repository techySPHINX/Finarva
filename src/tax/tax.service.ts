import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalculateTaxDto } from './dto/calculate-tax.dto';
import { taxBrackets } from './tax-brackets';
import PDFDocument from 'pdfkit';

@Injectable()
export class TaxService {
  constructor(private readonly prisma: PrismaService) { }

  async calculate(calculateTaxDto: CalculateTaxDto, userId: string) {
    const { income, expenses, year } = calculateTaxDto;

    const taxableIncome = income - expenses;
    const taxAmount = this.calculateTaxAmount(taxableIncome);

    const tax = await this.prisma.primary.tax.create({
      data: {
        user: { connect: { id: userId } },
        year,
        income,
        expenses,
        taxableIncome,
        taxAmount,
      },
    });

    return tax;
  }

  private calculateTaxAmount(taxableIncome: number): number {
    if (taxableIncome <= 0) {
      return 0;
    }

    let taxAmount = 0;
    for (const bracket of taxBrackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
        taxAmount += taxableInBracket * bracket.rate;
      }
    }

    return taxAmount;
  }

  getHistory(userId: string) {
    return this.prisma.readReplica.tax.findMany({ where: { userId } });
  }

  async generateTaxReport(userId: string, year: number): Promise<Buffer> {
    const taxData = await this.prisma.readReplica.tax.findFirst({
      where: { userId, year },
    });

    if (!taxData) {
      throw new NotFoundException(`Tax data for year ${year} not found`);
    }

    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));

    doc.fontSize(25).text('Tax Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Year: ${taxData.year}`);
    doc.moveDown();
    doc.fontSize(12).text(`Income: ${taxData.income}`);
    doc.text(`Expenses: ${taxData.expenses}`);
    doc.text(`Taxable Income: ${taxData.taxableIncome}`);
    doc.text(`Tax Amount: ${taxData.taxAmount}`);

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.end();
    });
  }
}
