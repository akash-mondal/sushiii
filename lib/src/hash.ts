import { createHash } from 'crypto';

export function hashSubjectId(rawId: string, tenantSalt: string): string {
  const hash = createHash('sha256');
  hash.update(`${rawId}:${tenantSalt}`);
  return hash.digest('hex');
}

export function hashPolicyContent(content: string): string {
  const hash = createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

export function verifyHash(data: string, expectedHash: string): boolean {
  const hash = createHash('sha256');
  hash.update(data);
  return hash.digest('hex') === expectedHash;
}
