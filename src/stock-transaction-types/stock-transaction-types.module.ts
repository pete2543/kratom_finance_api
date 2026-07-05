import { Module } from '@nestjs/common';
import { StockTransactionTypesController } from './stock-transaction-types.controller';
import { StockTransactionTypesService } from './stock-transaction-types.service';

@Module({
  controllers: [StockTransactionTypesController],
  providers: [StockTransactionTypesService],
  exports: [StockTransactionTypesService],
})
export class StockTransactionTypesModule {}
