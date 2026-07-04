import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { DropdownItemDto } from './dropdown-item.dto';

export class DropdownListResponseDto implements ApiResponseDto<
  DropdownItemDto[]
> {
  @ApiProperty({ example: 200 })
  status: number;

  @ApiProperty({ example: 'successfully' })
  message: string;

  @ApiProperty({ type: [DropdownItemDto] })
  data: DropdownItemDto[];
}
