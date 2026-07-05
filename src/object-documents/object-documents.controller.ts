import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import {
  ObjectDocumentQueryDto,
  ObjectDocumentResponseDto,
  UploadObjectDocumentDto,
} from './dto/object-document.dto';
import { ObjectDocumentsService } from './object-documents.service';

class ObjectDocumentApiResponseDto implements ApiResponseDto<ObjectDocumentResponseDto> {
  status: number;
  message: string;
  data: ObjectDocumentResponseDto;
}

@ApiTags('object-documents')
@Controller('object-documents')
export class ObjectDocumentsController {
  constructor(
    private readonly objectDocumentsService: ObjectDocumentsService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'อัปโหลดไฟล์ไป Supabase Storage และบันทึก object_document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        folder1: { type: 'string', example: 'orders' },
        table_name: { type: 'string', example: 'orders' },
        table_id: { type: 'integer', example: 1 },
      },
    },
  })
  @ApiOkResponse({ type: ObjectDocumentApiResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadObjectDocumentDto,
  ) {
    return this.objectDocumentsService.upload(file, dto);
  }

  @Get('by-reference')
  @ApiOperation({
    summary: 'ดึงไฟล์ตาม table_name + table_id (ใช้แสดงรูป product/order)',
  })
  @ApiOkResponse({ type: [ObjectDocumentResponseDto] })
  findByReference(@Query() query: ObjectDocumentQueryDto) {
    return this.objectDocumentsService.findByReference(
      query.tableName,
      query.tableId,
    );
  }

  @Get(':id/signed-url')
  @ApiOperation({ summary: 'สร้าง signed URL สำหรับดาวน์โหลดไฟล์' })
  getSignedUrl(@Param('id', ParseIntPipe) id: number) {
    return this.objectDocumentsService.getSignedUrl(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูข้อมูล object_document' })
  @ApiOkResponse({ type: ObjectDocumentApiResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.objectDocumentsService.findOne(id);
  }
}
