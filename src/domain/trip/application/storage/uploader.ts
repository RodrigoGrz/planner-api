export interface UploadParams {
  key: string
  contentType: string
  body: Buffer
}

export interface Uploader {
  upload(params: UploadParams): Promise<void>
  delete(key: string): Promise<void>
}
