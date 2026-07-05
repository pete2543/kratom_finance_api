import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  CustomerReportDetailDto,
  CustomerReportOrderDto,
  CustomerReportPeriodDto,
  CustomerReportQueryDto,
  CustomerReportSummaryDto,
  PaginatedCustomerOrdersReportDto,
  PaginatedCustomerReportResponseDto,
} from './dto/customer-report.dto';

type DateRange = {
  gte?: Date;
  lte?: Date;
};

@Injectable()
export class CustomerReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: CustomerReportQueryDto,
  ): Promise<PaginatedCustomerReportResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const period = this.resolvePeriod(query);
    const orderDateFilter = this.buildOrderDateFilter(period);

    const customerWhere: Prisma.customersWhereInput = {};

    if (query.search?.trim()) {
      const term = query.search.trim();
      customerWhere.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];
    }

    const customers = await this.prisma.customers.findMany({
      where: customerWhere,
      orderBy: { name: 'asc' },
    });

    const statsMap = await this.buildCustomerStatsMap(
      customers.map((c) => c.id),
      orderDateFilter,
    );

    let reportItems = customers.map((customer) => {
      const stats = statsMap.get(customer.id) ?? this.emptyStats();

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        lineUserId: customer.line_user_id,
        creditLimit:
          customer.credit_limit != null ? String(customer.credit_limit) : null,
        orderCount: stats.orderCount,
        totalAmount: stats.totalAmount,
        paidAmount: stats.paidAmount,
        outstandingAmount: stats.outstandingAmount,
        lastOrderDate: stats.lastOrderDate,
      };
    });

    if (query.hasOutstanding) {
      reportItems = reportItems.filter(
        (item) => Number(item.outstandingAmount) > 0,
      );
    }

    reportItems.sort((a, b) => {
      const diff = Number(b.totalAmount) - Number(a.totalAmount);
      return diff !== 0 ? diff : a.name.localeCompare(b.name, 'th');
    });

    const total = reportItems.length;
    const pagedItems = reportItems.slice(skip, skip + limit);

    const listSummary = reportItems.reduce(
      (acc, item) => ({
        customerCount: acc.customerCount + 1,
        totalAmount: acc.totalAmount + Number(item.totalAmount),
        paidAmount: acc.paidAmount + Number(item.paidAmount),
        outstandingAmount:
          acc.outstandingAmount + Number(item.outstandingAmount),
      }),
      {
        customerCount: 0,
        totalAmount: 0,
        paidAmount: 0,
        outstandingAmount: 0,
      },
    );

    return {
      items: pagedItems,
      summary: {
        customerCount: listSummary.customerCount,
        totalAmount: String(listSummary.totalAmount),
        paidAmount: String(listSummary.paidAmount),
        outstandingAmount: String(listSummary.outstandingAmount),
      },
      period: this.toPeriodDto(period),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(
    customerId: number,
    query: CustomerReportQueryDto,
  ): Promise<CustomerReportDetailDto> {
    const customer = await this.prisma.customers.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${customerId} not found`);
    }

    const period = this.resolvePeriod(query);
    const orderDateFilter = this.buildOrderDateFilter(period);
    const statsMap = await this.buildCustomerStatsMap(
      [customerId],
      orderDateFilter,
    );
    const stats = statsMap.get(customerId) ?? this.emptyStats();

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      lineUserId: customer.line_user_id,
      address: customer.address,
      creditLimit:
        customer.credit_limit != null ? String(customer.credit_limit) : null,
      createdAt: customer.created_at,
      summary: stats,
      period: this.toPeriodDto(period),
    };
  }

  async findCustomerOrders(
    customerId: number,
    query: CustomerReportQueryDto,
  ): Promise<PaginatedCustomerOrdersReportDto> {
    await this.ensureCustomerExists(customerId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const period = this.resolvePeriod(query);
    const orderDateFilter = this.buildOrderDateFilter(period);

    const where: Prisma.ordersWhereInput = {
      customer_id: customerId,
      ...(orderDateFilter ? { order_date: orderDateFilter } : {}),
    };

    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        include: {
          sale_types: { select: { code: true, label_th: true } },
          payment_statuses: { select: { code: true, label_th: true } },
          order_items: {
            include: { products_kt: { select: { name: true } } },
          },
          payments: { select: { amount: true } },
        },
        orderBy: { order_date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.orders.count({ where }),
    ]);

    const items: CustomerReportOrderDto[] = orders.map((order) => {
      const paidAmount = order.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0,
      );
      const totalAmount = Number(order.total_amount);

      return {
        id: order.id,
        totalAmount: String(totalAmount),
        paidAmount: String(paidAmount),
        outstandingAmount: String(Math.max(totalAmount - paidAmount, 0)),
        saleTypeCode: order.sale_types.code,
        saleTypeLabelTh: order.sale_types.label_th,
        paymentStatusCode: order.payment_statuses.code,
        paymentStatusLabelTh: order.payment_statuses.label_th,
        orderDate: order.order_date,
        dueDate: order.due_date,
        note: order.note,
        items: order.order_items.map((item) => ({
          productId: item.product_id,
          productName: item.products_kt.name,
          quantity: String(item.quantity),
          unitPrice: String(item.unit_price),
          subtotal: String(item.subtotal ?? 0),
        })),
      };
    });

    const statsMap = await this.buildCustomerStatsMap(
      [customerId],
      orderDateFilter,
    );

    return {
      items,
      summary: statsMap.get(customerId) ?? this.emptyStats(),
      period: this.toPeriodDto(period),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  private async buildCustomerStatsMap(
    customerIds: number[],
    orderDateFilter: DateRange | null,
  ) {
    if (customerIds.length === 0) {
      return new Map<number, CustomerReportSummaryDto & { lastOrderDate: Date | null }>();
    }

    const orders = await this.prisma.orders.findMany({
      where: {
        customer_id: { in: customerIds },
        ...(orderDateFilter ? { order_date: orderDateFilter } : {}),
      },
      select: {
        id: true,
        customer_id: true,
        total_amount: true,
        order_date: true,
        payments: { select: { amount: true } },
      },
    });

    const map = new Map<
      number,
      CustomerReportSummaryDto & { lastOrderDate: Date | null }
    >();

    for (const order of orders) {
      if (!order.customer_id) continue;

      const current = map.get(order.customer_id) ?? {
        ...this.emptyStats(),
        lastOrderDate: null,
      };

      const paidAmount = order.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0,
      );
      const totalAmount = Number(order.total_amount);
      const outstanding = Math.max(totalAmount - paidAmount, 0);

      current.orderCount += 1;
      current.totalAmount = String(
        Number(current.totalAmount) + totalAmount,
      );
      current.paidAmount = String(Number(current.paidAmount) + paidAmount);
      current.outstandingAmount = String(
        Number(current.outstandingAmount) + outstanding,
      );

      if (
        order.order_date &&
        (!current.lastOrderDate || order.order_date > current.lastOrderDate)
      ) {
        current.lastOrderDate = order.order_date;
      }

      map.set(order.customer_id, current);
    }

    return map;
  }

  private emptyStats(): CustomerReportSummaryDto & { lastOrderDate: Date | null } {
    return {
      orderCount: 0,
      totalAmount: '0',
      paidAmount: '0',
      outstandingAmount: '0',
      lastOrderDate: null,
    };
  }

  private resolvePeriod(query: CustomerReportQueryDto) {
    if (!query.dateTime) {
      return {
        from: undefined,
        to: undefined,
        dateTime: undefined,
      };
    }

    const anchor = new Date(query.dateTime);

    if (Number.isNaN(anchor.getTime())) {
      throw new BadRequestException('dateTime is invalid');
    }

    const from = new Date(
      anchor.getFullYear(),
      anchor.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const to = new Date(
      anchor.getFullYear(),
      anchor.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    return {
      from,
      to,
      dateTime: query.dateTime,
    };
  }

  private buildOrderDateFilter(period: {
    from?: Date;
    to?: Date;
  }): DateRange | null {
    if (!period.from && !period.to) {
      return null;
    }

    return {
      ...(period.from ? { gte: period.from } : {}),
      ...(period.to ? { lte: period.to } : {}),
    };
  }

  private toPeriodDto(period: {
    dateTime?: string;
  }): CustomerReportPeriodDto {
    return {
      dateTime: period.dateTime ?? null,
    };
  }

  private async ensureCustomerExists(customerId: number) {
    const customer = await this.prisma.customers.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${customerId} not found`);
    }
  }
}
