export interface DetectedImageType {
  contentType: 'image/jpeg' | 'image/png'
  extension: 'jpg' | 'png'
}

const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff])
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
])

function startsWith(buffer: Buffer, signature: Buffer) {
  return buffer.subarray(0, signature.length).equals(signature)
}

export function detectImageType(buffer: Buffer): DetectedImageType | null {
  if (startsWith(buffer, JPEG_SIGNATURE)) {
    return { contentType: 'image/jpeg', extension: 'jpg' }
  }

  if (startsWith(buffer, PNG_SIGNATURE)) {
    return { contentType: 'image/png', extension: 'png' }
  }

  return null
}
