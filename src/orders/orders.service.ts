import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  CheckoutOrderDto,
  OrderQueryDto,
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from './dto/order.dto';

type ProductForSale = {
  id: number;
  name: string;
  selling_price: Prisma.Decimal;
  is_active: boolean | null;
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(dto: CheckoutOrderDto): Promise<OrderResponseDto> {
    if (dto.customerId && dto.newCustomer) {
      throw new BadRequestException(
        'Send either customerId or newCustomer, not both',
      );
    }

    const saleType = await this.prisma.sale_types.findUnique({
      where: { id: dto.saleTypeId },
    });

    if (!saleType) {
      throw new NotFoundException(`Sale type ${dto.saleTypeId} not found`);
    }

    const isCredit = saleType.code.toLowerCase() === 'credit';

    if (!isCredit && !dto.payment) {
      throw new BadRequestException(
        'payment is required for non-credit sales',
      );
    }

    if (isCredit && !dto.dueDate) {
      throw new BadRequestException(
        'dueDate is required for credit sales',
      );
    }

    const lineItems = await this.buildLineItems(dto.items);
    const totalAmount = lineItems.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0,
    );

    if (totalAmount <= 0) {
      throw new BadRequestException('Order total must be greater than 0');
    }

    const paidAmount = await this.resolvePaidAmount(
      dto.payment,
      totalAmount,
      isCredit,
    );

    const paymentStatus = await this.resolvePaymentStatus(
      totalAmount,
      paidAmount,
    );

    const stockOutType = await this.prisma.stock_transaction_types.findUnique({
      where: { code: 'OUT' },
    });

    if (!stockOutType) {
      throw new BadRequestException(
        'Stock transaction type OUT not found in database',
      );
    }

    await this.validateStock(lineItems);

    const orderId = await this.prisma.$transaction(async (tx) => {
      const customerId = await this.resolveCustomerId(tx, dto);

      const order = await tx.orders.create({
        data: {
          customer_id: customerId,
          sale_type_id: dto.saleTypeId,
          payment_status_id: paymentStatus.id,
          total_amount: totalAmount,
          due_date: dto.dueDate ? new Date(dto.dueDate) : null,
          note: dto.note,
        },
      });

      await tx.order_items.createMany({
        data: lineItems.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: item.subtotal,
        })),
      });

      if (dto.payment && paidAmount > 0) {
        await tx.payments.create({
          data: {
            order_id: order.id,
            amount: paidAmount,
            method_id: dto.payment.methodId,
            note: dto.payment.note,
          },
        });
      }

      for (const item of lineItems) {
        await tx.stock_transactions.create({
          data: {
            product_id: item.productId,
            type_id: stockOutType.id,
            quantity: item.quantity,
            reference_type: 'ORDER',
            reference_id: order.id,
            note: `ขาย order #${order.id}`,
          },
        });
      }

      return order.id;
    });

    return this.findOne(orderId);
  }

  async findAll(query: OrderQueryDto): Promise<PaginatedOrdersResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ordersWhereInput = {};

    if (query.customerId !== undefined) {
      where.customer_id = query.customerId;
    }

    if (query.paymentStatusId !== undefined) {
      where.payment_status_id = query.paymentStatusId;
    }

    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.orders.count({ where }),
    ]);

    const items = await Promise.all(
      orders.map((order) => this.findOne(order.id)),
    );

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: number): Promise<OrderResponseDto> {
    const order = await this.prisma.orders.findUnique({
      where: { id },
      include: {
        customers: { select: { id: true, name: true, phone: true } },
        sale_types: { select: { id: true, code: true, label_th: true } },
        payment_statuses: { select: { id: true, code: true, label_th: true } },
        order_items: {
          include: {
            products_kt: { select: { name: true } },
          },
        },
        payments: {
          include: {
            payment_methods: {
              select: { id: true, code: true, label_th: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    const paidAmount = order.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    return {
      id: order.id,
      customer: order.customers
        ? {
            id: order.customers.id,
            name: order.customers.name,
            phone: order.customers.phone,
          }
        : null,
      saleTypeId: order.sale_type_id,
      saleTypeCode: order.sale_types.code,
      saleTypeLabelTh: order.sale_types.label_th,
      paymentStatusId: order.payment_status_id,
      paymentStatusCode: order.payment_statuses.code,
      paymentStatusLabelTh: order.payment_statuses.label_th,
      totalAmount: String(order.total_amount),
      paidAmount: String(paidAmount),
      orderDate: order.order_date,
      dueDate: order.due_date,
      note: order.note,
      items: order.order_items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.products_kt.name,
        quantity: String(item.quantity),
        unitPrice: String(item.unit_price),
        subtotal: String(item.subtotal ?? 0),
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        amount: String(payment.amount),
        methodId: payment.method_id,
        methodCode: payment.payment_methods.code,
        methodLabelTh: payment.payment_methods.label_th,
        paidAt: payment.paid_at,
        note: payment.note,
      })),
    };
  }

  private async buildLineItems(items: CheckoutOrderDto['items']) {
    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await this.prisma.products_kt.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map<number, ProductForSale>(
      products.map((product) => [product.id, product]),
    );

    return items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      if (product.is_active === false) {
        throw new BadRequestException(
          `Product ${product.name} is inactive`,
        );
      }

      const unitPrice = item.unitPrice ?? Number(product.selling_price);
      const subtotal = unitPrice * item.quantity;

      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      };
    });
  }

  private async validateStock(
    lineItems: Array<{ productId: number; productName: string; quantity: number }>,
  ) {
    for (const item of lineItems) {
      const balance = await this.getProductStockBalance(item.productId);

      if (balance < item.quantity) {
        throw new BadRequestException(
          `สินค้า "${item.productName}" คงเหลือ ${balance} ไม่พอ (ต้องการ ${item.quantity})`,
        );
      }
    }
  }

  private async getProductStockBalance(productId: number) {
    const transactions = await this.prisma.stock_transactions.findMany({
      where: { product_id: productId },
      select: {
        quantity: true,
        stock_transaction_types: { select: { code: true } },
      },
    });

    return transactions.reduce((sum, tx) => {
      const qty = Number(tx.quantity);
      const code = tx.stock_transaction_types.code.toUpperCase();
      const outbound = ['OUT', 'SALE', 'STOCK_OUT'].includes(code);
      return sum + (outbound ? -qty : qty);
    }, 0);
  }

  private async resolvePaidAmount(
    payment: CheckoutOrderDto['payment'],
    totalAmount: number,
    isCredit: boolean,
  ) {
    if (!payment) {
      return 0;
    }

    const method = await this.prisma.payment_methods.findUnique({
      where: { id: payment.methodId },
    });

    if (!method) {
      throw new NotFoundException(`Payment method ${payment.methodId} not found`);
    }

    const amount = payment.amount ?? (isCredit ? 0 : totalAmount);

    if (amount > totalAmount) {
      throw new BadRequestException('Payment amount cannot exceed order total');
    }

    if (!isCredit && amount < totalAmount) {
      throw new BadRequestException(
        'Non-credit sales require full payment amount',
      );
    }

    return amount;
  }

  private async resolvePaymentStatus(totalAmount: number, paidAmount: number) {
    let code = 'unpaid';

    if (paidAmount >= totalAmount) {
      code = 'paid';
    } else if (paidAmount > 0) {
      code = 'partial';
    }

    const status = await this.prisma.payment_statuses.findUnique({
      where: { code },
    });

    if (!status) {
      throw new BadRequestException(`Payment status ${code} not found`);
    }

    return status;
  }

  private async resolveCustomerId(
    tx: Prisma.TransactionClient,
    dto: CheckoutOrderDto,
  ) {
    if (dto.customerId) {
      const customer = await tx.customers.findUnique({
        where: { id: dto.customerId },
        select: { id: true },
      });

      if (!customer) {
        throw new NotFoundException(`Customer ${dto.customerId} not found`);
      }

      return customer.id;
    }

    if (dto.newCustomer) {
      const created = await tx.customers.create({
        data: {
          name: dto.newCustomer.name.trim(),
          phone: dto.newCustomer.phone?.trim(),
          line_user_id: dto.newCustomer.lineUserId?.trim(),
          address: dto.newCustomer.address?.trim(),
          credit_limit: dto.newCustomer.creditLimit ?? 0,
        },
      });

      return created.id;
    }

    return null;
  }
}
