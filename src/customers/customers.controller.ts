import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  CustomerQueryDto,
  CustomerResponseDto,
  PaginatedCustomersResponseDto,
} from './dto/customer.dto';

class CustomerApiResponseDto implements ApiResponseDto<CustomerResponseDto> {
  status: number;
  message: string;
  data: CustomerResponseDto;
}

class PaginatedCustomersApiResponseDto
  implements ApiResponseDto<PaginatedCustomersResponseDto>
{
  status: number;
  message: string;
  data: PaginatedCustomersResponseDto;
}

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'ค้นหา/เลือกลูกค้า (สำหรับหน้าขาย)' })
  @ApiOkResponse({ type: PaginatedCustomersApiResponseDto })
  findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูข้อมูลลูกค้า' })
  @ApiOkResponse({ type: CustomerApiResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'เพิ่มลูกค้าใหม่' })
  @ApiOkResponse({ type: CustomerApiResponseDto })
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }
}
