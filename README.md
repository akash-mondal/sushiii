# Sushiii

**Policy-Aware Consent Ledger on Constellation Network**

Sushiii is a decentralized consent management system built on Constellation Network's Metagraph technology. It provides cryptographic proof of consent for compliance (GDPR, CCPA) and audit purposes.

## Features

- **Immutable Consent Records**: All consent events stored on-chain with cryptographic finalization
- **Policy Versioning**: Track policy changes over time with content hashing
- **Privacy-First Design**: Subject IDs are hashed; no PII stored on-chain
- **Cryptographic Proofs**: Generate verifiable proof bundles for audits
- **Multi-Tenant**: Isolated data per tenant with API key authentication
- **Real-Time Queries**: Query consent state via REST API or direct metagraph access

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│  API Server  │────▶│   Metagraph     │
│     SDK     │     │  (Express)   │     │  (Scala/L0/L1)  │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Next.js UI  │
                    │ Admin/Auditor│
                    └──────────────┘
```

See [docs/architecture.md](docs/architecture.md) for details.

## Quick Start

### Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **SBT**: >= 1.9.8 (for Scala builds)
- **Docker**: For local Constellation network
- **Java**: JDK 11+ (for Scala/SBT)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sushiii
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy environment files:
```bash
cp .env.example .env
cp api/.env.example api/.env
cp app/.env.local.example app/.env.local
```

4. Set up Euclid (local Constellation network):
```bash
# Follow instructions from:
# https://github.com/Constellation-Labs/euclid-development-environment

# Then start the network:
./scripts/hydra start-genesis
```

5. Build the metagraph:
```bash
pnpm build:metagraph
```

6. Start the development servers:
```bash
pnpm dev
```

This will start:
- API server on http://localhost:3001
- Next.js UI on http://localhost:3000

### Verify Setup

Check that services are running:

```bash
# Health check
curl http://localhost:3001/health

# Metagraph status
curl http://localhost:9200/cluster/info
```

## Development Workflow

### Commands

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages for production
- `pnpm test` - Run all tests
- `pnpm test:unit` - Run unit tests only (fast)
- `pnpm typecheck` - TypeScript validation
- `pnpm format` - Format code with Prettier

### Project Structure

```
sushiii/
├── metagraph/          # Constellation Metagraph (Scala)
│   ├── shared/         # Data types and validators
│   ├── data_l1/        # Data L1 layer
│   └── l0/             # Metagraph L0 layer
├── api/                # Node.js API service
│   ├── routes/         # Express routes
│   ├── services/       # HGTP client, proof bundler
│   └── middleware/     # Auth, validation
├── app/                # Next.js UI
│   ├── app/(admin)/    # Admin portal
│   └── app/(auditor)/  # Auditor portal
├── sdk/
│   ├── browser/        # Browser SDK
│   └── node/           # Node.js SDK
├── verifier/           # Proof verification library
├── lib/                # Shared utilities
├── scripts/            # Development scripts
└── docs/               # Documentation
```

## Usage

### 1. Create a Policy

```bash
curl -X POST http://localhost:3001/api/policies \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -d '{
    "policy_id": "privacy-policy",
    "version": "1.0.0",
    "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "uri": "https://example.com/privacy",
    "jurisdiction": "US",
    "effective_from": "2024-01-01T00:00:00Z"
  }'
```

### 2. Capture Consent (Browser SDK)

```typescript
import { SushiiiClient } from '@sushiii/sdk-browser';

const client = new SushiiiClient({
  apiUrl: 'http://localhost:3001',
  apiKey: 'test-key'
});

await client.captureConsent({
  subject_id: 'hashed-user-id',
  policy_ref: { policy_id: 'privacy-policy', version: '1.0.0' },
  event_type: 'granted'
});
```

### 3. Generate Proof Bundle

```bash
curl -X POST http://localhost:3001/api/proof-bundles/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -d '{"subject_id": "hashed-user-id"}'
```

### 4. Verify Proof

```bash
./scripts/verify-proof.sh <bundle-id>
```

## Testing

### Unit Tests (Fast)

```bash
pnpm test:unit
```

### Metagraph Tests (Requires Euclid)

```bash
./scripts/hydra start-genesis
pnpm test:metagraph
```

### Integration Tests

```bash
pnpm test
```

## Deployment

### IntegrationNet

```bash
./scripts/deploy-metagraph.sh integration
```

### MainNet

```bash
./scripts/deploy-metagraph.sh mainnet
```

See [docs/constellation-integration.md](docs/constellation-integration.md) for deployment details.

## Documentation

- [Architecture](docs/architecture.md) - System design and components
- [HGTP Guide](docs/hgtp-guide.md) - Metagraph data submission
- [Verification](docs/verification.md) - Proof bundle verification
- [Constellation Integration](docs/constellation-integration.md) - Network integration
- [Snapshot Queries](docs/snapshot-queries.md) - State queries

## Security

### Privacy Model

- Subject IDs are SHA-256 hashed with tenant salt
- Policy content stored off-chain (S3/IPFS)
- Only metadata and hashes on-chain
- No PII in metagraph state

### Authentication

- Tenant-based API key authentication
- Ed25519 signatures for proof bundles
- Validator enforcement at metagraph layer

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and test: `pnpm test && pnpm typecheck`
4. Format code: `pnpm format`
5. Commit: `git commit -m "feat: add my feature"`
6. Push and create a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Resources

- [Constellation Docs](https://docs.constellationnetwork.io)
- [Metagraph Examples](https://github.com/Constellation-Labs/metagraph-examples)
- [Euclid SDK](https://github.com/Constellation-Labs/euclid-development-environment)
- [dag4.js](https://docs.constellationnetwork.io/network-apis/api-reference/dag4.js)

## Support

For questions and support:
- GitHub Issues: [Report bugs or request features]
- Discord: [Constellation Network Discord](https://discord.gg/constellationnetwork)
