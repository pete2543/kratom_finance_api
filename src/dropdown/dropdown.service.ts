/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DropdownItemDto } from './dto/dropdown-item.dto';

type DropdownRow = {
  id: number;
  code: string;
  label_th: string;
};

@Injectable()
export class DropdownService {
  constructor(private readonly prisma: PrismaService) {}

  async getSaleTypes(): Promise<DropdownItemDto[]> {
    const items = await this.prisma.sale_types.findMany({
      select: { id: true, code: true, label_th: true },
      orderBy: { id: 'asc' },
    });

    return this.toDropdownItems(items);
  }

  async getStockTransactionTypes(): Promise<DropdownItemDto[]> {
    const items = await this.prisma.stock_transaction_types.findMany({
      select: { id: true, code: true, label_th: true },
      orderBy: { id: 'asc' },
    });

    return this.toDropdownItems(items);
  }

  async getNotificationTypes(): Promise<DropdownItemDto[]> {
    const items = await this.prisma.notification_types.findMany({
      select: { id: true, code: true, label_th: true },
      orderBy: { id: 'asc' },
    });

    return this.toDropdownItems(items);
  }

  async getPaymentMethods(): Promise<DropdownItemDto[]> {
    const items = await this.prisma.payment_methods.findMany({
      select: { id: true, code: true, label_th: true },
      orderBy: { id: 'asc' },
    });

    return this.toDropdownItems(items);
  }

  async getPaymentStatuses(): Promise<DropdownItemDto[]> {
    const items = await this.prisma.payment_statuses.findMany({
      select: { id: true, code: true, label_th: true },
      orderBy: { id: 'asc' },
    });

    return this.toDropdownItems(items);
  }

  private toDropdownItems(items: DropdownRow[]): DropdownItemDto[] {
    return items.map(({ id, code, label_th }) => ({
      id,
      code,
      labelTh: label_th,
    }));
  }
}
