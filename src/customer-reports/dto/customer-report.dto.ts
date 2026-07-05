import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CustomerReportQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'สมชาย' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: '2026-07-05T00:00:00.000Z',
    description:
      'datetime เดียว — กรองออเดอร์ในเดือนเดียวกับ datetime ที่ส่งมา',
  })
  @IsOptional()
  @IsDateString()
  dateTime?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'แสดงเฉพาะลูกค้าที่มียอดค้างชำระ',
  })
  @IsOptional()
  @Type(() => Boolean)
  hasOutstanding?: boolean;
}

export class CustomerReportPeriodDto {
  @ApiPropertyOptional()
  dateTime?: string | null;
}

export class CustomerReportSummaryDto {
  @ApiProperty()
  orderCount: number;

  @ApiProperty({ description: 'ยอดขายรวม' })
  totalAmount: string;

  @ApiProperty({ description: 'ยอดชำระแล้ว' })
  paidAmount: string;

  @ApiProperty({ description: 'ยอดค้างชำระ (เตรียมไว้สำหรับทวงหนี้)' })
  outstandingAmount: string;
}

export class CustomerReportItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiPropertyOptional()
  lineUserId?: string | null;

  @ApiPropertyOptional()
  creditLimit?: string | null;

  @ApiProperty()
  orderCount: number;

  @ApiProperty()
  totalAmount: string;

  @ApiProperty()
  paidAmount: string;

  @ApiProperty()
  outstandingAmount: string;

  @ApiPropertyOptional()
  lastOrderDate?: Date | null;
}

export class CustomerReportListSummaryDto {
  @ApiProperty()
  customerCount: number;

  @ApiProperty()
  totalAmount: string;

  @ApiProperty()
  paidAmount: string;

  @ApiProperty()
  outstandingAmount: string;
}

export class PaginatedCustomerReportResponseDto {
  @ApiProperty({ type: [CustomerReportItemDto] })
  items: CustomerReportItemDto[];

  @ApiProperty({ type: CustomerReportListSummaryDto })
  summary: CustomerReportListSummaryDto;

  @ApiProperty({ type: CustomerReportPeriodDto })
  period: CustomerReportPeriodDto;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class CustomerReportDetailDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiPropertyOptional()
  lineUserId?: string | null;

  @ApiPropertyOptional()
  address?: string | null;

  @ApiPropertyOptional()
  creditLimit?: string | null;

  @ApiPropertyOptional()
  createdAt?: Date | null;

  @ApiProperty({ type: CustomerReportSummaryDto })
  summary: CustomerReportSummaryDto;

  @ApiProperty({ type: CustomerReportPeriodDto })
  period: CustomerReportPeriodDto;
}

export class CustomerReportOrderItemDto {
  @ApiProperty()
  productId: number;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  quantity: string;

  @ApiProperty()
  unitPrice: string;

  @ApiProperty()
  subtotal: string;
}

export class CustomerReportOrderDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  totalAmount: string;

  @ApiProperty()
  paidAmount: string;

  @ApiProperty()
  outstandingAmount: string;

  @ApiProperty()
  saleTypeCode: string;

  @ApiProperty()
  saleTypeLabelTh: string;

  @ApiProperty()
  paymentStatusCode: string;

  @ApiProperty()
  paymentStatusLabelTh: string;

  @ApiPropertyOptional()
  orderDate?: Date | null;

  @ApiPropertyOptional()
  dueDate?: Date | null;

  @ApiPropertyOptional()
  note?: string | null;

  @ApiProperty({ type: [CustomerReportOrderItemDto] })
  items: CustomerReportOrderItemDto[];
}

export class PaginatedCustomerOrdersReportDto {
  @ApiProperty({ type: [CustomerReportOrderDto] })
  items: CustomerReportOrderDto[];

  @ApiProperty({ type: CustomerReportSummaryDto })
  summary: CustomerReportSummaryDto;

  @ApiProperty({ type: CustomerReportPeriodDto })
  period: CustomerReportPeriodDto;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}
