```
Sushiii: Policy-Aware Consent Ledger on Constellation Network

## Commands
- `pnpm install`: Install dependencies across all workspace packages
- `pnpm dev`: Start local Euclid environment + API server (3001) + Next.js UI (3000)
- `pnpm build`: Build metagraph, API, and UI for production
- `pnpm test`: Run all tests (slow, ~5min)
- `pnpm test:unit`: Run unit tests only (fast, prefer during dev)
- `pnpm test:metagraph`: Test metagraph validators against local network
- `pnpm typecheck`: TypeScript validation across all packages
- `scripts/hydra start-genesis`: Start fresh Euclid dev environment from genesis
- `scripts/hydra status`: Check running container status
- `scripts/hydra stop`: Stop all running containers
- `scripts/deploy-metagraph.sh`: Deploy metagraph to IntegrationNet/MainNet
- `scripts/seed-policies.sh`: Populate sample policies for testing
- `scripts/verify-proof.sh <bundle-id>`: CLI proof verification demo

## Architecture
```

sushiii/
 ├── metagraph/              # Constellation Metagraph (Scala)
 │   ├── data_l1/           # Data L1 layer (policy/consent events)
 │   ├── l0/                # Metagraph L0 layer (snapshot consensus)
 │   └── shared/            # Shared schemas and models
 ├── api/                   # Node/TypeScript ingestion service
 │   ├── routes/            # Express routes (policies, consents, proof-bundles)
 │   ├── services/          # Business logic (HGTP client, proof bundler)
 │   └── middleware/        # Auth, validation, error handling
 ├── app/                   # Next.js admin/auditor UI (App Router)
 │   ├── app/(admin)/       # Policy management UI
 │   ├── app/(auditor)/     # Proof bundle export UI
 │   └── components/        # Shared React components
 ├── sdk/                   # Client libraries
 │   ├── browser/           # Browser consent capture SDK
 │   └── node/              # Server-side SDK for batch operations
 ├── verifier/              # Standalone proof validation library
 └── docs/                  # Architecture, HGTP integration, verification guides

```
text
## Key Files
- `metagraph/shared/src/main/scala/com/sushiii/shared_data/types/PolicyVersion.scala`: PolicyVersion case class
- `metagraph/shared/src/main/scala/com/sushiii/shared_data/types/ConsentEvent.scala`: ConsentEvent case class
- `metagraph/data_l1/src/main/scala/com/sushiii/data_l1/Main.scala`: Data L1 entry point and custom routes
- `metagraph/l0/src/main/scala/com/sushiii/l0/Main.scala`: Metagraph L0 entry point
- `api/services/hgtp-client.ts`: HGTP submission wrapper with auto-retry
- `api/services/proof-bundler.ts`: Assembles signed ProofBundle from Hypergraph finalization refs
- `api/middleware/tenant-auth.ts`: Tenant API key validation
- `sdk/browser/src/consent.ts`: Browser consent capture flow
- `verifier/src/verify.ts`: ProofBundle signature and finalization verification
- `lib/hash.ts`: SHA-256 content hashing (use for all policy hashes)

## Constellation Network Specifics

### Euclid SDK Environment
- Local dev runs 3-node cluster: Global L0 (9000), Metagraph L0 (9200, 9210, 9220), Currency L1 (9300+), Data L1 (9400+)
- After `scripts/hydra start-genesis`, verify cluster health: `curl http://localhost:9200/cluster/info`
- Metagraph ID is generated on first run; copy from console output to `.env.local`

### Data L1 Custom Routes
- Define POST endpoints in `metagraph/data_l1/src/main/scala/com/sushiii/data_l1/Main.scala`
- Routes accept JSON payloads and return updates to be included in next snapshot
- Use `calculatedStateService.getCalculatedState()` to read current metagraph state before validation

### Validators
- PolicyVersion validator: `metagraph/shared/src/main/scala/com/sushiii/shared_data/validations/PolicyVersionValidator.scala`
  - Enforces unique (policy_id, version) tuples
  - Rejects duplicate content_hash for same policy_id
  - Validates jurisdiction format (ISO 3166-1 alpha-2)
- ConsentEvent validator: `metagraph/shared/src/main/scala/com/sushiii/shared_data/validations/ConsentEventValidator.scala`
  - Verifies PolicyVersion exists in state before accepting ConsentEvent
  - Rejects events with future timestamps
  - Validates subject_id is hashed (64-char hex string)

### Snapshot Structure
- Snapshots include all validated PolicyVersions and ConsentEvents since last snapshot
- Stored in metagraph state at `calculatedState.policyVersions` and `calculatedState.consentEvents`
- ProofBundle assembly queries snapshot history via Metagraph L0 API: `GET /snapshots/:ordinal`

### dag4.js Integration
- Connect to metagraph: `dag4.account.createMetagraphTokenClient({ l0Url, l1Url, metagraphId })`
- Send data updates: `POST :metagraph-data-l1-endpoint/data-application` with signed payload
- Query state: `GET :metagraph-l0-endpoint/snapshots/latest` for current state

## Code Style

### Scala (Metagraph)
- Follow Constellation SDK conventions (see existing examples in `metagraph-examples` repo)
- Case classes for data types, validators return `Either[ValidationError, Unit]`
- Use `cats` and `cats-effect` for functional patterns (IO, applicative validation)
- No mutable state in validators; all state reads via `calculatedStateService`

### TypeScript (API, SDK, UI)
- ES modules only (import/export), no CommonJS
- Destructure imports: `import { foo } from 'bar'`
- Async/await over .then() chains
- All API routes validate with Zod schemas before processing
- Use TypeScript `strict` mode; no `any` types without justification comment

### React (Next.js UI)
- Server Components by default; mark with `'use client'` only when needed
- Co-locate components with routes in `app/(section)/` folders
- Use Shadcn/UI components; import from `@/components/ui`
- Fetch data in Server Components; use React Query for client-side mutations

## Privacy and Security Rules

### What Goes On-Chain
✅ Hashed subject_id (SHA-256 with tenant salt)
✅ Policy content_hash (SHA-256 of full policy text)
✅ PolicyVersion metadata (policy_id, version, jurisdiction, effective_from)
✅ ConsentEvent metadata (event_type, timestamp)
✅ ProofBundle signatures (Ed25519)

### What Stays Off-Chain
❌ Raw subject identifiers (user IDs, emails, names)
❌ Full policy text (store in S3/IPFS, reference via URI in PolicyVersion)
❌ PII of any kind
❌ API keys or secrets (use env vars, never commit)

### Hashing
- Always use `lib/hash.ts` helpers: `hashSubjectId(rawId, tenantSalt)` and `hashPolicyContent(text)`
- SHA-256 only; metagraph validators reject SHA-1 or other algorithms
- Subject IDs must be 64-char hex strings; validator will reject other formats

## Testing

### Unit Tests (Fast)
- `pnpm test:unit` during development
- Mock HGTP client responses in `api/__tests__/__mocks__/hgtp-client.ts`
- Test validators in isolation with sample PolicyVersion/ConsentEvent fixtures

### Metagraph Tests (Medium)
- `pnpm test:metagraph` runs validators against local Euclid network
- Requires `scripts/hydra start-genesis` running first
- Tests in `metagraph/data_l1/src/test/scala/`

### Integration Tests (Slow)
- Full end-to-end flow: submit policy → capture consent → export proof → verify
- Runs against local network; see `api/__tests__/integration/`
- Always run before deploying: `pnpm test && pnpm typecheck`

## Common Gotchas

### Constellation/HGTP
- Metagraph Data L1 must be fully synced before accepting POST requests (check `/node/info` state)
- Snapshot ordinals are sequential; missing ordinals mean network is catching up
- For HGTP client errors, see `docs/hgtp-troubleshooting.md`
- Euclid containers must be stopped cleanly with `scripts/hydra stop` or state corruption can occur

### PolicyVersion
- `content_hash` MUST be SHA-256 (Scala validator rejects other algorithms)
- Duplicate (policy_id, version) tuples rejected by validator
- `effective_from` must be ISO 8601 timestamp; validator checks format
- Jurisdiction codes must be valid ISO 3166-1 alpha-2 (e.g., "US", "GB", "IN")

### ConsentEvent
- PolicyVersion must exist in metagraph state before ConsentEvent is accepted
- `timestamp` cannot be in the future (validator checks against node time)
- `subject_id` must be 64-char hex string (result of SHA-256 hash)
- Events with unknown `policy_ref` (policy_id + version) are rejected

### ProofBundle
- Signatures use Ed25519; verifier lib validates automatically
- Finalization refs point to snapshot ordinals; verify via Metagraph L0 API
- Bundle assembly can be slow for subjects with 1000+ events; consider pagination

### Next.js
- App Router requires `'use client'` for useState, useEffect, onClick handlers
- Server Components cannot use browser APIs (localStorage, window, etc.)
- ISR pages need revalidation tags for proof bundle cache: `revalidateTag('proof-bundle-123')`

## Documentation References
When working on specific features, consult these docs:
- HGTP client usage or `HGTPValidationError`: `docs/hgtp-guide.md`
- ProofBundle verification flow: `docs/verification.md`
- Constellation L0/L1 integration patterns: `docs/constellation-integration.md`
- Metagraph state queries and snapshot API: `docs/snapshot-queries.md`
- Euclid SDK troubleshooting: https://docs.constellationnetwork.io/metagraph-development

## Workflow

### Branching
- Feature branches: `feature/short-description`
- Bug fixes: `fix/issue-description`
- Metagraph changes: `metagraph/feature-name`

### Commits
- Small, focused commits with clear messages
- Prefix: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
- Example: `feat: add policy version diff endpoint`

### Before Committing
1. `pnpm typecheck` (must pass)
2. `pnpm test:unit` (must pass)
3. For metagraph changes: `pnpm test:metagraph` (must pass)
4. Format code: `pnpm format` (Prettier + scalafmt)

### Schema Changes
- Bump version in `metagraph/shared/src/main/scala/com/sushiii/shared_data/package.scala`
- Update validators in `metagraph/shared/src/main/scala/com/sushiii/shared_data/validations/`
- Document breaking changes in `CHANGELOG.md`
- Re-run `scripts/hydra start-genesis` to apply schema changes locally

### Deployment
- IntegrationNet: `scripts/deploy-metagraph.sh --network integration`
- MainNet: `scripts/deploy-metagraph.sh --network mainnet` (requires approval)
- Verify deployment: check Metagraph L0 `/node/info` endpoint shows correct state

## Anti-patterns

### ❌ Don't
- Store PII on-chain
- Use `--force` flag in HGTP submissions
- Mutate state in Scala validators
- Log full policy text in API responses
- Hardcode metagraph IDs or endpoints (use env vars)
- Deploy to MainNet without IntegrationNet testing

### ✅ Do
- Hash all subject identifiers with tenant salt
- Use `--validate-only` for dry runs, then submit without flags
- Return new state from validators; read-only via `calculatedStateService`
- Log only metadata (policy_id, version, content_hash)
- Configure via `.env` files per environment
- Test on IntegrationNet for at least 24 hours before MainNet

## Hackathon Submission Checklist
- [ ] Metagraph deployed to IntegrationNet with public endpoints
- [ ] API and UI deployed and accessible (include URLs in README)
- [ ] Open-source repo with MIT license
- [ ] README with architecture diagram, setup instructions, demo video link
- [ ] 90-120s pitch video with code walkthrough (upload to YouTube/Loom)
- [ ] Working demo: publish policy → capture consent → export proof → verify
- [ ] All tests passing: `pnpm test && pnpm typecheck`
- [ ] Documentation in `/docs` for local development and deployment
- [ ] Metagraph IDs and endpoints documented in README

## Resources
- Constellation docs: https://docs.constellationnetwork.io
- Metagraph examples: https://github.com/Constellation-Labs/metagraph-examples
- Euclid SDK: https://github.com/Constellation-Labs/euclid-development-environment
- dag4.js API reference: https://docs.constellationnetwork.io/network-apis/api-reference/dag4.js
- Stargazer wallet integration: https://docs.constellationnetwork.io/stargazer
- Discord #hackathon-general: Get help from Constellation community

## Quick Reference: Metagraph URLs (Local Euclid)
```

Global L0:      http://localhost:9000/node/info
 Metagraph L0:   http://localhost:9200/node/info (node 1)
 Currency L1:    http://localhost:9300/node/info (node 1)
 Data L1:        http://localhost:9400/node/info (node 1)
 Cluster info:   http://localhost:9200/cluster/info
 Snapshots:      http://localhost:9200/snapshots/latest