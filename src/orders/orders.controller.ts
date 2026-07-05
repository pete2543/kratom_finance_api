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
import {
  CheckoutOrderDto,
  OrderQueryDto,
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from './dto/order.dto';
import { OrdersService } from './orders.service';

class OrderApiResponseDto implements ApiResponseDto<OrderResponseDto> {
  status: number;
  message: string;
  data: OrderResponseDto;
}

class PaginatedOrdersApiResponseDto
  implements ApiResponseDto<PaginatedOrdersResponseDto>
{
  status: number;
  message: string;
  data: PaginatedOrdersResponseDto;
}

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({
    summary:
      'ขายสินค้า — รองรับลูกค้าเก่า/ใหม่, รายการสินค้า, ชำระเงิน, ตัดสต็อก',
  })
  @ApiOkResponse({ type: OrderApiResponseDto })
  checkout(@Body() dto: CheckoutOrderDto) {
    return this.ordersService.checkout(dto);
  }

  @Get()
  @ApiOperation({ summary: 'รายการออเดอร์' })
  @ApiOkResponse({ type: PaginatedOrdersApiResponseDto })
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดออเดอร์' })
  @ApiOkResponse({ type: OrderApiResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }
}
