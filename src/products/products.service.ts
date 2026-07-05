import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateProductDto,
  PaginatedProductsResponseDto,
  ProductQueryDto,
  ProductResponseDto,
  UpdateProductDto,
} from './dto/product.dto';

type ProductRow = {
  id: number;
  name: string;
  cost_price: Prisma.Decimal;
  selling_price: Prisma.Decimal;
  unit: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
};

@Injectable()
export class ProductsService {
  private readonly productTableName = 'products';

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  async findAll(query: ProductQueryDto): Promise<PaginatedProductsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.products_ktWhereInput = {};

    if (query.search?.trim()) {
      where.name = { contains: query.search.trim(), mode: 'insensitive' };
    }

    if (query.isActive !== undefined) {
      where.is_active = query.isActive;
    }

    const [items, total, stockBalances] = await Promise.all([
      this.prisma.products_kt.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.products_kt.count({ where }),
      this.getStockBalanceMap(),
    ]);

    const imageUrls = await this.getImageUrlMap(items.map((item) => item.id));

    return {
      items: items.map((item) =>
        this.toResponse(
          item,
          stockBalances.get(item.id) ?? '0',
          imageUrls.get(item.id),
        ),
      ),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.prisma.products_kt.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    const [stockBalances, imageUrls] = await Promise.all([
      this.getStockBalanceMap([id]),
      this.getImageUrlMap([id]),
    ]);

    return this.toResponse(
      product,
      stockBalances.get(id) ?? '0',
      imageUrls.get(id),
    );
  }

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.prisma.products_kt.create({
      data: {
        name: dto.name.trim(),
        cost_price: dto.costPrice ?? 0,
        selling_price: dto.sellingPrice,
        unit: dto.unit ?? 'ขวด',
        is_active: dto.isActive ?? true,
      },
    });

    return this.toResponse(product, '0');
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductResponseDto> {
    await this.ensureExists(id);

    const product = await this.prisma.products_kt.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.costPrice !== undefined && { cost_price: dto.costPrice }),
        ...(dto.sellingPrice !== undefined && {
          selling_price: dto.sellingPrice,
        }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
        ...(dto.isActive !== undefined && { is_active: dto.isActive }),
        updated_at: new Date(),
      },
    });

    const stockBalances = await this.getStockBalanceMap([id]);
    const imageUrls = await this.getImageUrlMap([id]);

    return this.toResponse(
      product,
      stockBalances.get(id) ?? '0',
      imageUrls.get(id),
    );
  }

  async remove(id: number): Promise<{ id: number }> {
    await this.ensureExists(id);

    await this.prisma.products_kt.update({
      where: { id },
      data: { is_active: false, updated_at: new Date() },
    });

    return { id };
  }

  private async ensureExists(id: number) {
    const product = await this.prisma.products_kt.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
  }

  private async getStockBalanceMap(productIds?: number[]) {
    const transactions = await this.prisma.stock_transactions.findMany({
      where: productIds?.length ? { product_id: { in: productIds } } : undefined,
      select: {
        product_id: true,
        quantity: true,
        stock_transaction_types: { select: { code: true } },
      },
    });

    const balances = new Map<number, number>();

    for (const tx of transactions) {
      const current = balances.get(tx.product_id) ?? 0;
      const signedQty = this.getSignedQuantity(
        tx.stock_transaction_types.code,
        Number(tx.quantity),
      );
      balances.set(tx.product_id, current + signedQty);
    }

    return new Map(
      [...balances.entries()].map(([id, qty]) => [id, String(qty)]),
    );
  }

  private async getImageUrlMap(productIds: number[]) {
    if (productIds.length === 0) {
      return new Map<number, string>();
    }

    const docs = await this.prisma.object_document.findMany({
      where: {
        table_name: this.productTableName,
        table_id: { in: productIds },
      },
      orderBy: { created_date: 'desc' },
    });

    const map = new Map<number, string>();

    for (const doc of docs) {
      if (doc.table_id == null || map.has(doc.table_id)) {
        continue;
      }

      map.set(
        doc.table_id,
        this.supabase.getPublicUrl(doc.full_path ?? doc.object_name ?? ''),
      );
    }

    return map;
  }

  private getSignedQuantity(typeCode: string, quantity: number) {
    const outboundCodes = ['OUT', 'SALE', 'STOCK_OUT'];
    return outboundCodes.includes(typeCode.toUpperCase()) ? -quantity : quantity;
  }

  private toResponse(
    product: ProductRow,
    stockBalance: string,
    imageUrl?: string,
  ): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      costPrice: String(product.cost_price),
      sellingPrice: String(product.selling_price),
      unit: product.unit,
      isActive: product.is_active,
      stockBalance,
      imageUrl: imageUrl ?? null,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };
  }
}
