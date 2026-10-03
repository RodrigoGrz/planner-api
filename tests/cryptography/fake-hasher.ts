import { HashComparer } from '@/domain/trip/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/trip/application/cryptography/hash-generator'

export class FakeHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    return plain.concat('-hashed')
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return plain.concat('-hashed') === hashed
  }
}
