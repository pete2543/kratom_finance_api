import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { StockTransactionTypesService } from '../stock-transaction-types/stock-transaction-types.service';
import {
  CreateInboundStockDto,
  CreateStockTransactionDto,
  PaginatedStockTransactionsResponseDto,
  StockTransactionQueryDto,
  StockTransactionResponseDto,
} from './dto/stock-transaction.dto';

const OUTBOUND_TYPE_CODES = ['OUT', 'SALE', 'STOCK_OUT'];

@Injectable()
export class StockTransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockTransactionTypesService: StockTransactionTypesService,
  ) {}

  async findAll(
    query: StockTransactionQueryDto,
  ): Promise<PaginatedStockTransactionsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.stock_transactionsWhereInput = {};

    if (query.productId !== undefined) {
      where.product_id = query.productId;
    }

    if (query.typeId !== undefined) {
      where.type_id = query.typeId;
    }

    const [items, total] = await Promise.all([
      this.prisma.stock_transactions.findMany({
        where,
        include: {
          products_kt: { select: { name: true } },
          stock_transaction_types: {
            select: { code: true, label_th: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.stock_transactions.count({ where }),
    ]);

    return {
      items: await Promise.all(
        items.map(async (item) => {
          const balance = await this.getProductStockBalance(item.product_id);
          return this.toResponse(item, balance);
        }),
      ),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: number): Promise<StockTransactionResponseDto> {
    const item = await this.prisma.stock_transactions.findUnique({
      where: { id },
      include: {
        products_kt: { select: { name: true } },
        stock_transaction_types: { select: { code: true, label_th: true } },
      },
    });

    if (!item) {
      throw new NotFoundException(`Stock transaction ${id} not found`);
    }

    const balance = await this.getProductStockBalance(item.product_id);

    return this.toResponse(item, balance);
  }

  async create(
    dto: CreateStockTransactionDto,
  ): Promise<StockTransactionResponseDto> {
    await this.ensureProductExists(dto.productId);
    await this.stockTransactionTypesService.findOne(dto.typeId);

    const item = await this.prisma.stock_transactions.create({
      data: {
        product_id: dto.productId,
        type_id: dto.typeId,
        quantity: dto.quantity,
        reference_type: dto.referenceType,
        reference_id: dto.referenceId,
        note: dto.note,
      },
      include: {
        products_kt: { select: { name: true } },
        stock_transaction_types: { select: { code: true, label_th: true } },
      },
    });

    const balance = await this.getProductStockBalance(item.product_id);

    return this.toResponse(item, balance);
  }

  async createInbound(
    dto: CreateInboundStockDto,
  ): Promise<StockTransactionResponseDto> {
    const inboundType = await this.stockTransactionTypesService.findByCode('IN');

    if (!inboundType) {
      throw new BadRequestException(
        'Stock type IN not found. Create stock transaction type with code IN first.',
      );
    }

    return this.create({
      productId: dto.productId,
      typeId: inboundType.id,
      quantity: dto.quantity,
      referenceType: 'INBOUND',
      note: dto.note,
    });
  }

  async remove(id: number): Promise<{ id: number }> {
    const item = await this.prisma.stock_transactions.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException(`Stock transaction ${id} not found`);
    }

    await this.prisma.stock_transactions.delete({ where: { id } });

    return { id };
  }

  private async ensureProductExists(productId: number) {
    const product = await this.prisma.products_kt.findUnique({
      where: { id: productId },
      select: { id: true, is_active: true },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    if (product.is_active === false) {
      throw new BadRequestException(`Product ${productId} is inactive`);
    }
  }

  private async getProductStockBalance(productId: number): Promise<string> {
    const transactions = await this.prisma.stock_transactions.findMany({
      where: { product_id: productId },
      select: {
        quantity: true,
        stock_transaction_types: { select: { code: true } },
      },
    });

    const balance = transactions.reduce((sum, tx) => {
      const qty = Number(tx.quantity);
      const signed = OUTBOUND_TYPE_CODES.includes(
        tx.stock_transaction_types.code.toUpperCase(),
      )
        ? -qty
        : qty;
      return sum + signed;
    }, 0);

    return String(balance);
  }

  private toResponse(
    item: {
      id: number;
      product_id: number;
      type_id: number;
      quantity: Prisma.Decimal;
      reference_type: string | null;
      reference_id: number | null;
      note: string | null;
      created_at: Date | null;
      products_kt: { name: string };
      stock_transaction_types: { code: string; label_th: string };
    },
    stockBalanceAfter: string,
  ): StockTransactionResponseDto {
    return {
      id: item.id,
      productId: item.product_id,
      productName: item.products_kt.name,
      typeId: item.type_id,
      typeCode: item.stock_transaction_types.code,
      typeLabelTh: item.stock_transaction_types.label_th,
      quantity: String(item.quantity),
      referenceType: item.reference_type,
      referenceId: item.reference_id,
      note: item.note,
      stockBalanceAfter,
      createdAt: item.created_at,
    };
  }
}
