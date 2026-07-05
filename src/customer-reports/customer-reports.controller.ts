import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CustomerReportsService } from './customer-reports.service';
import {
  CustomerReportDetailDto,
  CustomerReportQueryDto,
  PaginatedCustomerOrdersReportDto,
  PaginatedCustomerReportResponseDto,
} from './dto/customer-report.dto';

class PaginatedCustomerReportApiResponseDto
  implements ApiResponseDto<PaginatedCustomerReportResponseDto>
{
  status: number;
  message: string;
  data: PaginatedCustomerReportResponseDto;
}

class CustomerReportDetailApiResponseDto
  implements ApiResponseDto<CustomerReportDetailDto>
{
  status: number;
  message: string;
  data: CustomerReportDetailDto;
}

class PaginatedCustomerOrdersReportApiResponseDto
  implements ApiResponseDto<PaginatedCustomerOrdersReportDto>
{
  status: number;
  message: string;
  data: PaginatedCustomerOrdersReportDto;
}

@ApiTags('customer-reports')
@Controller('customer-reports')
export class CustomerReportsController {
  constructor(
    private readonly customerReportsService: CustomerReportsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'รายงานลูกค้าทั้งหมด — ยอดซื้อ/ชำระ/ค้างชำระ (กรองวันที่ได้)',
  })
  @ApiOkResponse({ type: PaginatedCustomerReportApiResponseDto })
  findAll(@Query() query: CustomerReportQueryDto) {
    return this.customerReportsService.findAll(query);
  }

  @Get(':customerId/orders')
  @ApiOperation({
    summary: 'ประวัติออเดอร์ของลูกค้า — กรองวัน/เดือน/ปีได้',
  })
  @ApiOkResponse({ type: PaginatedCustomerOrdersReportApiResponseDto })
  findCustomerOrders(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query() query: CustomerReportQueryDto,
  ) {
    return this.customerReportsService.findCustomerOrders(customerId, query);
  }

  @Get(':customerId')
  @ApiOperation({ summary: 'สรุปยอดลูกค้ารายคน' })
  @ApiOkResponse({ type: CustomerReportDetailApiResponseDto })
  findOne(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query() query: CustomerReportQueryDto,
  ) {
    return this.customerReportsService.findOne(customerId, query);
  }
}
