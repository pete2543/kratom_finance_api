import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CustomerQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'สมชาย' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'สมชาย ใจดี' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: '0812345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'U1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lineUserId?: string;

  @ApiPropertyOptional({ example: '123 ถ.สุขุมวิท กรุงเทพ' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @Type(() => Number)
  creditLimit?: number;
}

export class CustomerResponseDto {
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
}

export class PaginatedCustomersResponseDto {
  @ApiProperty({ type: [CustomerResponseDto] })
  items: CustomerResponseDto[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}
