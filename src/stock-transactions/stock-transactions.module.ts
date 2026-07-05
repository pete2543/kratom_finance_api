import { Module } from '@nestjs/common';
import { StockTransactionTypesModule } from '../stock-transaction-types/stock-transaction-types.module';
import { StockTransactionsController } from './stock-transactions.controller';
import { StockTransactionsService } from './stock-transactions.service';

@Module({
  imports: [StockTransactionTypesModule],
  controllers: [StockTransactionsController],
  providers: [StockTransactionsService],
})
export class StockTransactionsModule {}
