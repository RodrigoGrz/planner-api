import {
  Uploader,
  UploadParams,
} from '@/domain/trip/application/storage/uploader'
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { env } from '@/env'

export class R2Storage implements Uploader {
  private client: S3Client

  constructor() {
    this.client = new S3Client({
      endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  async upload({ key, contentType, body }: UploadParams): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        Body: body,
      }),
    )
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: env.AWS_BUCKET_NAME,
          Key: key,
        }),
      )
    } catch (error) {
      console.error(`Failed to delete storage object "${key}"`, error)
    }
  }
}
