import { ApiProperty } from '@nestjs/swagger';

export class DropdownItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'CASH' })
  code: string;

  @ApiProperty({ example: 'เงินสด' })
  labelTh: string;
}
