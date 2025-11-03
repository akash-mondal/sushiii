# Proof Bundle Verification

## Overview

Proof bundles provide cryptographic evidence of consent events finalized on the Constellation metagraph.

## Bundle Structure

```typescript
{
  subject_id: string;           // SHA-256 hashed
  consents: ConsentEvent[];     // All consent events for subject
  snapshot_refs: SnapshotRef[]; // Finalized snapshot references
  generated_at: string;         // ISO 8601 timestamp
  signature: string;            // Ed25519 signature
}
```

## Verification Steps

### 1. Signature Verification

Verify the bundle signature using Ed25519:

```typescript
const verifier = new ProofVerifier(metagraphL0Url);
const result = await verifier.verifyBundle(bundle);
```

### 2. Snapshot Verification

For each snapshot reference:
1. Query metagraph L0: `GET /snapshots/{ordinal}`
2. Compare returned hash with bundle's snapshot_ref.hash
3. Ensure snapshot is finalized (confirmed by multiple validators)

### 3. Content Verification

Verify each consent event:
1. Check subject_id matches bundle.subject_id
2. Verify PolicyVersion exists in referenced snapshot
3. Confirm timestamp is valid and not in future

## CLI Verification

```bash
./scripts/verify-proof.sh <bundle-id>
```

## Programmatic Verification

```typescript
import { ProofVerifier } from '@sushiii/verifier';

const verifier = new ProofVerifier('http://localhost:9200');
const result = await verifier.verifyBundle(bundle);

if (result.valid) {
  console.log('Bundle verified successfully');
} else {
  console.error('Verification failed:', result.errors);
}
```

## Trust Model

- Bundles are signed by API server
- Snapshot references prove finalization on metagraph
- Independent verification possible using public metagraph endpoints
- No trust required in API server after bundle export
