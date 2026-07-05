import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ObjectDocumentResponseDto,
  UploadObjectDocumentDto,
} from './dto/object-document.dto';

@Injectable()
export class ObjectDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  async upload(
    file: Express.Multer.File | undefined,
    dto: UploadObjectDocumentDto,
  ): Promise<ObjectDocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('file is required');
    }

    const folder = dto.folder1?.trim() || 'uploads';
    const safeName = this.sanitizeFileName(file.originalname);
    const objectName = `${folder}/${randomUUID()}_${safeName}`;
    const etag = createHash('md5').update(file.buffer).digest('hex');
    const fileExtension = this.getFileExtension(file.originalname);

    try {
      const { path } = await this.supabase.upload(objectName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

      const fullPath = path;
      const publicUrl = this.supabase.getPublicUrl(fullPath);

      const record = await this.prisma.object_document.create({
        data: {
          etag,
          bucket: this.supabase.bucketName,
          folder1: folder,
          full_path: fullPath,
          file_name: file.originalname,
          content_type: file.mimetype,
          content_size: file.size,
          file_extention: fileExtension,
          object_name: objectName,
          table_name: dto.table_name,
          table_id: dto.table_id,
        },
      });

      return this.toResponse(record, publicUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown upload error';
      throw new BadRequestException(`Upload failed: ${message}`);
    }
  }

  async findOne(id: number): Promise<ObjectDocumentResponseDto> {
    const record = await this.prisma.object_document.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Object document ${id} not found`);
    }

    const publicUrl = this.supabase.getPublicUrl(
      record.full_path ?? record.object_name ?? '',
    );

    return this.toResponse(record, publicUrl);
  }

  async getSignedUrl(id: number, expiresIn = 3600): Promise<{ url: string }> {
    const record = await this.prisma.object_document.findUnique({
      where: { id },
    });

    if (!record?.object_name) {
      throw new NotFoundException(`Object document ${id} not found`);
    }

    try {
      const url = await this.supabase.createSignedUrl(
        record.object_name,
        expiresIn,
      );
      return { url };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create signed URL';
      throw new BadRequestException(message);
    }
  }

  private sanitizeFileName(filename: string): string {
    return filename.replace(/[^\w.\-()]/g, '_');
  }

  private getFileExtension(filename: string): string {
    const index = filename.lastIndexOf('.');
    return index >= 0 ? filename.slice(index + 1) : '';
  }

  private toResponse(
    record: {
      id: number;
      etag: string;
      bucket: string | null;
      folder1: string | null;
      full_path: string | null;
      file_name: string;
      content_type: string | null;
      content_size: unknown;
      file_extention: string | null;
      object_name: string | null;
      table_name: string | null;
      table_id: number | null;
      created_date: Date;
    },
    publicUrl?: string,
  ): ObjectDocumentResponseDto {
    return {
      id: record.id,
      etag: record.etag,
      bucket: record.bucket,
      folder1: record.folder1,
      full_path: record.full_path,
      file_name: record.file_name,
      content_type: record.content_type,
      content_size:
        record.content_size != null ? String(record.content_size) : null,
      file_extention: record.file_extention,
      object_name: record.object_name,
      table_name: record.table_name,
      table_id: record.table_id,
      created_date: record.created_date,
      public_url: publicUrl,
    };
  }
}
