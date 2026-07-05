import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStockTransactionTypeDto {
  @ApiProperty({ example: 'IN' })
  @IsString()
  @MaxLength(10)
  code: string;

  @ApiProperty({ example: 'รับเข้าสต็อก' })
  @IsString()
  @MaxLength(50)
  labelTh: string;
}

export class UpdateStockTransactionTypeDto {
  @ApiPropertyOptional({ example: 'IN' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;

  @ApiPropertyOptional({ example: 'รับเข้าสต็อก' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  labelTh?: string;
}

export class StockTransactionTypeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  labelTh: string;
}
