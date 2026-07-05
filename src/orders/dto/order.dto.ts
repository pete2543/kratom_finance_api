import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateCustomerDto } from '../../customers/dto/customer.dto';

export class CheckoutItemDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  productId: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  quantity: number;

  @ApiPropertyOptional({
    example: 120,
    description: 'ถ้าไม่ส่งจะใช้ราคาขายจากสินค้า',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice?: number;
}

export class CheckoutPaymentDto {
  @ApiProperty({ example: 1, description: 'payment_methods.id' })
  @Type(() => Number)
  @IsInt()
  methodId: number;

  @ApiPropertyOptional({
    example: 240,
    description: 'ถ้าไม่ส่งจะใช้ยอดรวมออเดอร์',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ example: 'โอนแล้ว' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CheckoutOrderDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'ลูกค้าเก่า — ส่ง customerId หรือ newCustomer อย่างใดอย่างหนึ่ง',
  })
  @ValidateIf((dto: CheckoutOrderDto) => !dto.newCustomer)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;

  @ApiPropertyOptional({
    description: 'ลูกค้าใหม่ — สร้างลูกค้าแล้วผูกกับออเดอร์ทันที',
  })
  @ValidateIf((dto: CheckoutOrderDto) => !dto.customerId)
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  newCustomer?: CreateCustomerDto;

  @ApiProperty({ example: 1, description: 'sale_types.id (cash/transfer/credit)' })
  @Type(() => Number)
  @IsInt()
  saleTypeId: number;

  @ApiProperty({ type: [CheckoutItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiPropertyOptional({
    description: 'ข้อมูลการชำระเงิน — บังคับเมื่อ sale type ไม่ใช่ credit',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CheckoutPaymentDto)
  payment?: CheckoutPaymentDto;

  @ApiPropertyOptional({
    example: '2026-07-20',
    description: 'วันครบกำหนดชำระ (แนะนำเมื่อ sale type = credit)',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'ลูกค้าประจำ' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class OrderQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  paymentStatusId?: number;
}

export class OrderItemResponseDto {
  @ApiProperty()
  id: number;

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

export class OrderPaymentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  methodId: number;

  @ApiProperty()
  methodCode: string;

  @ApiProperty()
  methodLabelTh: string;

  @ApiPropertyOptional()
  paidAt?: Date | null;

  @ApiPropertyOptional()
  note?: string | null;
}

export class OrderCustomerResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  phone?: string | null;
}

export class OrderResponseDto {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional()
  customer?: OrderCustomerResponseDto | null;

  @ApiProperty()
  saleTypeId: number;

  @ApiProperty()
  saleTypeCode: string;

  @ApiProperty()
  saleTypeLabelTh: string;

  @ApiProperty()
  paymentStatusId: number;

  @ApiProperty()
  paymentStatusCode: string;

  @ApiProperty()
  paymentStatusLabelTh: string;

  @ApiProperty()
  totalAmount: string;

  @ApiProperty()
  paidAmount: string;

  @ApiPropertyOptional()
  orderDate?: Date | null;

  @ApiPropertyOptional()
  dueDate?: Date | null;

  @ApiPropertyOptional()
  note?: string | null;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ type: [OrderPaymentResponseDto] })
  payments: OrderPaymentResponseDto[];
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  items: OrderResponseDto[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}
