import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import {
  CreateProductDto,
  PaginatedProductsResponseDto,
  ProductQueryDto,
  ProductResponseDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductsService } from './products.service';

class ProductApiResponseDto implements ApiResponseDto<ProductResponseDto> {
  status: number;
  message: string;
  data: ProductResponseDto;
}

class PaginatedProductsApiResponseDto
  implements ApiResponseDto<PaginatedProductsResponseDto>
{
  status: number;
  message: string;
  data: PaginatedProductsResponseDto;
}

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'รายการสินค้า (พร้อมยอดคงเหลือสต็อก)' })
  @ApiOkResponse({ type: PaginatedProductsApiResponseDto })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูสินค้าตาม id' })
  @ApiOkResponse({ type: ProductApiResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'สร้างสินค้า' })
  @ApiOkResponse({ type: ProductApiResponseDto })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขสินค้า' })
  @ApiOkResponse({ type: ProductApiResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ปิดการใช้งานสินค้า (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
