import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private readonly s3: S3Client;
  private readonly storageBucket: string;
  private readonly projectRef: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('supabase.s3Endpoint');
    const region = this.configService.get<string>('supabase.s3Region');
    const accessKeyId = this.configService.get<string>('supabase.accessKeyId');
    const secretAccessKey = this.configService.get<string>(
      'supabase.secretAccessKey',
    );
    this.storageBucket =
      this.configService.get<string>('supabase.storageBucket') ??
      'krartom-storage';
    this.projectRef =
      this.configService.get<string>('supabase.projectRef') ?? '';

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'Supabase S3 is not configured. Set SUPABASE_S3_ENDPOINT, SUPABASE_S3_ACCESS_KEY_ID, and SUPABASE_S3_SECRET_ACCESS_KEY in .env',
      );
    }

    if (!endpoint.includes('/storage/v1/s3')) {
      throw new Error(
        'SUPABASE_S3_ENDPOINT must be the S3 endpoint from Supabase Dashboard → Storage → S3, e.g. https://YOUR_PROJECT_REF.storage.supabase.co/storage/v1/s3',
      );
    }

    this.s3 = new S3Client({
      forcePathStyle: true,
      region: region ?? 'ap-southeast-1',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  get bucketName() {
    return this.storageBucket;
  }

  async upload(
    objectPath: string,
    file: Buffer,
    options: { contentType: string; upsert?: boolean },
  ) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.storageBucket,
        Key: objectPath,
        Body: file,
        ContentType: options.contentType,
      }),
    );

    return { path: objectPath };
  }

  getPublicUrl(objectPath: string) {
    const encodedPath = objectPath
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    if (this.projectRef) {
      return `https://${this.projectRef}.supabase.co/storage/v1/object/public/${this.storageBucket}/${encodedPath}`;
    }

    return `${this.storageBucket}/${objectPath}`;
  }

  async createSignedUrl(objectPath: string, expiresIn: number) {
    const command = new GetObjectCommand({
      Bucket: this.storageBucket,
      Key: objectPath,
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }
}
