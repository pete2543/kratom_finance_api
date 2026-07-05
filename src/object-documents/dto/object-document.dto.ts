import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UploadObjectDocumentDto {
  @ApiPropertyOptional({ example: 'orders' })
  @IsOptional()
  @IsString()
  folder1?: string;

  @ApiPropertyOptional({ example: 'orders' })
  @IsOptional()
  @IsString()
  table_name?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  table_id?: number;
}

export class ObjectDocumentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  etag: string;

  @ApiPropertyOptional()
  bucket?: string | null;

  @ApiPropertyOptional()
  folder1?: string | null;

  @ApiPropertyOptional()
  full_path?: string | null;

  @ApiProperty()
  file_name: string;

  @ApiPropertyOptional()
  content_type?: string | null;

  @ApiPropertyOptional()
  content_size?: string | null;

  @ApiPropertyOptional()
  file_extention?: string | null;

  @ApiPropertyOptional()
  object_name?: string | null;

  @ApiPropertyOptional()
  table_name?: string | null;

  @ApiPropertyOptional()
  table_id?: number | null;

  @ApiProperty()
  created_date: Date;

  @ApiPropertyOptional()
  public_url?: string;
}
