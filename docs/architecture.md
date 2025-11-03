# Sushiii Architecture

## Overview

Sushiii is a policy-aware consent ledger built on Constellation Network's Metagraph technology. It provides cryptographic proof of consent for compliance and audit purposes.

## Components

### Metagraph Layer (Scala)

- **Shared**: Common data types (PolicyVersion, ConsentEvent) and validators
- **Data L1**: Custom routes for accepting policy and consent submissions
- **L0**: Snapshot consensus and state management

### API Layer (TypeScript/Node.js)

- Express-based REST API
- HGTP client for submitting to metagraph
- Proof bundler for generating verifiable consent proofs
- Tenant authentication middleware

### UI Layer (Next.js)

- **Admin Portal**: Policy management interface
- **Auditor Portal**: Proof bundle generation and verification

### SDK

- **Browser SDK**: Consent capture for web applications
- **Node SDK**: Batch operations for server-side integrations

### Verifier

Standalone library for verifying proof bundles against the metagraph.

## Data Flow

1. Admin creates PolicyVersion via UI → API → HGTP → Data L1 → L0 snapshot
2. Application captures consent → SDK → API → HGTP → Data L1 → L0 snapshot
3. Auditor requests proof → API queries L0 snapshots → Generates signed bundle
4. Verifier validates bundle → Checks signatures → Verifies snapshot references

## Privacy Model

- Subject IDs are hashed with tenant salt (SHA-256)
- Policy content is stored off-chain; only content_hash on-chain
- No PII stored in metagraph state
- Proof bundles include cryptographic references to finalized snapshots

## State Structure

```typescript
{
  policyVersions: Map<String, PolicyVersion>,
  consentEvents: List<ConsentEvent>
}
```

## Security Considerations

- API key authentication per tenant
- Ed25519 signatures for proof bundles
- Validator enforcement at metagraph layer
- Immutable audit trail via snapshot finalization
