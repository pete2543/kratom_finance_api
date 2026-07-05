import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import {
  CreateInboundStockDto,
  CreateStockTransactionDto,
  PaginatedStockTransactionsResponseDto,
  StockTransactionQueryDto,
  StockTransactionResponseDto,
} from './dto/stock-transaction.dto';
import { StockTransactionsService } from './stock-transactions.service';

class StockTransactionApiResponseDto
  implements ApiResponseDto<StockTransactionResponseDto>
{
  status: number;
  message: string;
  data: StockTransactionResponseDto;
}

class PaginatedStockTransactionsApiResponseDto
  implements ApiResponseDto<PaginatedStockTransactionsResponseDto>
{
  status: number;
  message: string;
  data: PaginatedStockTransactionsResponseDto;
}

@ApiTags('stock-transactions')
@Controller('stock-transactions')
export class StockTransactionsController {
  constructor(
    private readonly stockTransactionsService: StockTransactionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'รายการธุรกรรมสต็อก' })
  @ApiOkResponse({ type: PaginatedStockTransactionsApiResponseDto })
  findAll(@Query() query: StockTransactionQueryDto) {
    return this.stockTransactionsService.findAll(query);
  }

  @Post('inbound')
  @ApiOperation({ summary: 'รับของเข้าสต็อก (type IN)' })
  @ApiOkResponse({ type: StockTransactionApiResponseDto })
  createInbound(@Body() dto: CreateInboundStockDto) {
    return this.stockTransactionsService.createInbound(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูธุรกรรมสต็อกตาม id' })
  @ApiOkResponse({ type: StockTransactionApiResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockTransactionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'สร้างธุรกรรมสต็อก' })
  @ApiOkResponse({ type: StockTransactionApiResponseDto })
  create(@Body() dto: CreateStockTransactionDto) {
    return this.stockTransactionsService.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบธุรกรรมสต็อก' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stockTransactionsService.remove(id);
  }
}
