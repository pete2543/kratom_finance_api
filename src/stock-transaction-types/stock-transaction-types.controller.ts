import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import {
  CreateStockTransactionTypeDto,
  StockTransactionTypeResponseDto,
  UpdateStockTransactionTypeDto,
} from './dto/stock-transaction-type.dto';
import { StockTransactionTypesService } from './stock-transaction-types.service';

class StockTransactionTypeApiResponseDto
  implements ApiResponseDto<StockTransactionTypeResponseDto>
{
  status: number;
  message: string;
  data: StockTransactionTypeResponseDto;
}

@ApiTags('stock-transaction-types')
@Controller('stock-transaction-types')
export class StockTransactionTypesController {
  constructor(
    private readonly stockTransactionTypesService: StockTransactionTypesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'รายการประเภทธุรกรรมสต็อก' })
  @ApiOkResponse({ type: [StockTransactionTypeResponseDto] })
  findAll() {
    return this.stockTransactionTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูประเภทธุรกรรมสต็อกตาม id' })
  @ApiOkResponse({ type: StockTransactionTypeApiResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockTransactionTypesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'สร้างประเภทธุรกรรมสต็อก' })
  @ApiOkResponse({ type: StockTransactionTypeApiResponseDto })
  create(@Body() dto: CreateStockTransactionTypeDto) {
    return this.stockTransactionTypesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขประเภทธุรกรรมสต็อก' })
  @ApiOkResponse({ type: StockTransactionTypeApiResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockTransactionTypeDto,
  ) {
    return this.stockTransactionTypesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบประเภทธุรกรรมสต็อก' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stockTransactionTypesService.remove(id);
  }
}
