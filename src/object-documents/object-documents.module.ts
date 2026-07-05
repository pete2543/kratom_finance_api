import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { ObjectDocumentsController } from './object-documents.controller';
import { ObjectDocumentsService } from './object-documents.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ObjectDocumentsController],
  providers: [ObjectDocumentsService],
  exports: [ObjectDocumentsService],
})
export class ObjectDocumentsModule {}
