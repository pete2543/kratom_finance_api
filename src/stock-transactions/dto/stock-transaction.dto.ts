import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class StockTransactionQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  typeId?: number;
}

export class CreateStockTransactionDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  productId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  typeId: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  quantity: number;

  @ApiPropertyOptional({ example: 'purchase' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  referenceType?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  referenceId?: number;

  @ApiPropertyOptional({ example: 'รับของจาก supplier' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateInboundStockDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  productId: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  quantity: number;

  @ApiPropertyOptional({ example: 'รับของเข้าคลัง' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class StockTransactionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  typeId: number;

  @ApiProperty()
  typeCode: string;

  @ApiProperty()
  typeLabelTh: string;

  @ApiProperty()
  quantity: string;

  @ApiPropertyOptional()
  referenceType?: string | null;

  @ApiPropertyOptional()
  referenceId?: number | null;

  @ApiPropertyOptional()
  note?: string | null;

  @ApiPropertyOptional()
  stockBalanceAfter?: string;

  @ApiPropertyOptional()
  createdAt?: Date | null;
}

export class PaginatedStockTransactionsResponseDto {
  @ApiProperty({ type: [StockTransactionResponseDto] })
  items: StockTransactionResponseDto[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}
