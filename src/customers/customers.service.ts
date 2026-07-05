import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  CreateCustomerDto,
  CustomerQueryDto,
  CustomerResponseDto,
  PaginatedCustomersResponseDto,
} from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: CustomerQueryDto,
  ): Promise<PaginatedCustomersResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.customersWhereInput = {};

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.customers.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.customers.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toResponse(item)),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: number): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customers.findUnique({ where: { id } });

    if (!customer) {
      throw new NotFoundException(`Customer ${id} not found`);
    }

    return this.toResponse(customer);
  }

  async create(dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    try {
      const customer = await this.prisma.customers.create({
        data: {
          name: dto.name.trim(),
          phone: dto.phone?.trim(),
          line_user_id: dto.lineUserId?.trim(),
          address: dto.address?.trim(),
          credit_limit: dto.creditLimit ?? 0,
        },
      });

      return this.toResponse(customer);
    } catch {
      throw new ConflictException(
        'Customer with this LINE user id already exists',
      );
    }
  }

  toResponse(customer: {
    id: number;
    name: string;
    phone: string | null;
    line_user_id: string | null;
    address: string | null;
    credit_limit: Prisma.Decimal | null;
    created_at: Date | null;
  }): CustomerResponseDto {
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      lineUserId: customer.line_user_id,
      address: customer.address,
      creditLimit:
        customer.credit_limit != null ? String(customer.credit_limit) : null,
      createdAt: customer.created_at,
    };
  }
}
