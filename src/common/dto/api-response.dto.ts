import { ApiProperty } from '@nestjs/swagger';

export const SUCCESS_MESSAGE = 'successfully';

export class ApiResponseDto<T> {
  @ApiProperty({ example: 200 })
  status: number;

  @ApiProperty({ example: SUCCESS_MESSAGE })
  message: string;

  @ApiProperty()
  data: T;
}

export class PaginatedMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class PaginatedDataDto<T> {
  @ApiProperty()
  items: T[];

  @ApiProperty()
  meta: PaginatedMetaDto;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ example: 200 })
  status: number;

  @ApiProperty({ example: SUCCESS_MESSAGE })
  message: string;

  @ApiProperty()
  data: PaginatedDataDto<T>;
}
