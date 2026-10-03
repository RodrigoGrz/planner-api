import { compare, hash } from 'bcryptjs'
import { HashComparer } from '@/domain/trip/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/trip/application/cryptography/hash-generator'

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_ROUNDS = 10

  hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_ROUNDS)
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed)
  }
}
