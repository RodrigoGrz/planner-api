import {
  Uploader,
  UploadParams,
} from '@/domain/trip/application/storage/uploader'

export class FakeUploader implements Uploader {
  public uploads: UploadParams[] = []
  public deletedKeys: string[] = []

  async upload(params: UploadParams): Promise<void> {
    this.uploads.push(params)
  }

  async delete(key: string): Promise<void> {
    this.deletedKeys.push(key)
  }
}
