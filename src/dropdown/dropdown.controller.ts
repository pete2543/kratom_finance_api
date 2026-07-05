import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DropdownService } from './dropdown.service';
import { DropdownListResponseDto } from './dto/dropdown-list-response.dto';

@ApiTags('dropdown')
@Controller('dropdown')
export class DropdownController {
  constructor(private readonly dropdownService: DropdownService) {}

  @Get('sale-types')
  @ApiOperation({ summary: 'รายการประเภทการขาย' })
  @ApiOkResponse({ type: DropdownListResponseDto })
  getSaleTypes() {
    return this.dropdownService.getSaleTypes();
  }

  @Get('stock-transaction-types')
  @ApiOperation({ summary: 'รายการประเภทธุรกรรมสต็อก' })
  @ApiOkResponse({ type: DropdownListResponseDto })
  getStockTransactionTypes() {
    return this.dropdownService.getStockTransactionTypes();
  }

  @Get('notification-types')
  @ApiOperation({ summary: 'รายการประเภทการแจ้งเตือน' })
  @ApiOkResponse({ type: DropdownListResponseDto })
  getNotificationTypes() {
    return this.dropdownService.getNotificationTypes();
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'รายการช่องทางชำระเงิน' })
  @ApiOkResponse({ type: DropdownListResponseDto })
  getPaymentMethods() {
    return this.dropdownService.getPaymentMethods();
  }

  @Get('payment-statuses')
  @ApiOperation({ summary: 'รายการสถานะการชำระเงิน' })
  @ApiOkResponse({ type: DropdownListResponseDto })
  getPaymentStatuses() {
    return this.dropdownService.getPaymentStatuses();
  }
}
