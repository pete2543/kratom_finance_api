import { registerAs } from '@nestjs/config';

function extractProjectRef(endpoint: string): string {
  const match = endpoint.match(/https:\/\/([a-z0-9-]+)\.storage\.supabase\.co/i);
  return match?.[1] ?? '';
}

export default registerAs('supabase', () => {
  const s3Endpoint =
    process.env.SUPABASE_S3_ENDPOINT ??
    process.env.SUPABASE_URL ??
    '';
  const accessKeyId =
    process.env.SUPABASE_S3_ACCESS_KEY_ID ??
    process.env.SUPABASE_ACCESS_KEY_ID ??
    '';
  const secretAccessKey =
    process.env.SUPABASE_S3_SECRET_ACCESS_KEY ??
    process.env.SUPABASE_SECRET_ACCESS_KEY ??
    '';

  return {
    s3Endpoint: s3Endpoint.replace(/\/+$/, ''),
    s3Region: process.env.SUPABASE_S3_REGION ?? 'ap-southeast-1',
    accessKeyId,
    secretAccessKey,
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'krartom-storage',
    projectRef:
      process.env.SUPABASE_PROJECT_REF ?? extractProjectRef(s3Endpoint),
  };
});
