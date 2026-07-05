import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateStockTransactionTypeDto,
  StockTransactionTypeResponseDto,
  UpdateStockTransactionTypeDto,
} from './dto/stock-transaction-type.dto';

@Injectable()
export class StockTransactionTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<StockTransactionTypeResponseDto[]> {
    const items = await this.prisma.stock_transaction_types.findMany({
      orderBy: { id: 'asc' },
    });

    return items.map((item) => this.toResponse(item));
  }

  async findOne(id: number): Promise<StockTransactionTypeResponseDto> {
    const item = await this.prisma.stock_transaction_types.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Stock transaction type ${id} not found`);
    }

    return this.toResponse(item);
  }

  async create(
    dto: CreateStockTransactionTypeDto,
  ): Promise<StockTransactionTypeResponseDto> {
    try {
      const item = await this.prisma.stock_transaction_types.create({
        data: {
          code: dto.code.trim().toUpperCase(),
          label_th: dto.labelTh.trim(),
        },
      });

      return this.toResponse(item);
    } catch {
      throw new ConflictException(`Code ${dto.code} already exists`);
    }
  }

  async update(
    id: number,
    dto: UpdateStockTransactionTypeDto,
  ): Promise<StockTransactionTypeResponseDto> {
    await this.ensureExists(id);

    try {
      const item = await this.prisma.stock_transaction_types.update({
        where: { id },
        data: {
          ...(dto.code !== undefined && {
            code: dto.code.trim().toUpperCase(),
          }),
          ...(dto.labelTh !== undefined && { label_th: dto.labelTh.trim() }),
        },
      });

      return this.toResponse(item);
    } catch {
      throw new ConflictException('Code already exists');
    }
  }

  async remove(id: number): Promise<{ id: number }> {
    await this.ensureExists(id);

    const inUse = await this.prisma.stock_transactions.count({
      where: { type_id: id },
    });

    if (inUse > 0) {
      throw new ConflictException(
        'Cannot delete type that is used in stock transactions',
      );
    }

    await this.prisma.stock_transaction_types.delete({ where: { id } });

    return { id };
  }

  async findByCode(code: string) {
    return this.prisma.stock_transaction_types.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  private async ensureExists(id: number) {
    const item = await this.prisma.stock_transaction_types.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException(`Stock transaction type ${id} not found`);
    }
  }

  private toResponse(item: {
    id: number;
    code: string;
    label_th: string;
  }): StockTransactionTypeResponseDto {
    return {
      id: item.id,
      code: item.code,
      labelTh: item.label_th,
    };
  }
}
