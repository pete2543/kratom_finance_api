import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import supabaseConfig from './config/supabase.config';
import { DatabaseModule } from './database/database.module';
import { DropdownModule } from './dropdown/dropdown.module';
import { HealthModule } from './health/health.module';
import { ObjectDocumentsModule } from './object-documents/object-documents.module';
import { CustomerReportsModule } from './customer-reports/customer-reports.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { StockTransactionTypesModule } from './stock-transaction-types/stock-transaction-types.module';
import { StockTransactionsModule } from './stock-transactions/stock-transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, supabaseConfig],
    }),
    DatabaseModule,
    HealthModule,
    DropdownModule,
    ObjectDocumentsModule,
    CustomersModule,
    CustomerReportsModule,
    ProductsModule,
    StockTransactionTypesModule,
    StockTransactionsModule,
    OrdersModule,
  ],
})
export class AppModule {}
