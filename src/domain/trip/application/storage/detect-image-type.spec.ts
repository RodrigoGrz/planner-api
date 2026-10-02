import { detectImageType } from './detect-image-type'

const pngSignature = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
])
const jpegSignature = Buffer.from([0xff, 0xd8, 0xff, 0xe0])

describe('Detect image type', () => {
  it('should be able to detect a png by its signature', () => {
    const buffer = Buffer.concat([pngSignature, Buffer.from('image-data')])

    expect(detectImageType(buffer)).toEqual({
      contentType: 'image/png',
      extension: 'png',
    })
  })

  it('should be able to detect a jpeg by its signature', () => {
    const buffer = Buffer.concat([jpegSignature, Buffer.from('image-data')])

    expect(detectImageType(buffer)).toEqual({
      contentType: 'image/jpeg',
      extension: 'jpg',
    })
  })

  it('should not be able to detect a type for text content', () => {
    const buffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')

    expect(detectImageType(buffer)).toBeNull()
  })

  it('should not be able to detect a type for a gif', () => {
    const buffer = Buffer.from('GIF89a-image-data')

    expect(detectImageType(buffer)).toBeNull()
  })

  it('should not be able to detect a type for a buffer shorter than the signature', () => {
    const buffer = Buffer.from([0x89, 0x50])

    expect(detectImageType(buffer)).toBeNull()
  })
})
