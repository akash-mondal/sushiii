# Constellation Network Integration

## Metagraph Development

Sushiii is built as a Constellation metagraph, which provides:
- Custom data structures (PolicyVersion, ConsentEvent)
- Custom validation logic
- Independent consensus separate from Global L0
- Snapshot-based state management

## Local Development with Euclid

### Setup

1. Clone Euclid SDK:
```bash
git clone https://github.com/Constellation-Labs/euclid-development-environment
cd euclid-development-environment
```

2. Start local network:
```bash
./scripts/hydra install
./scripts/hydra build
./scripts/hydra start-genesis
```

3. Verify cluster:
```bash
curl http://localhost:9200/cluster/info
```

### Metagraph URLs

- **Global L0**: http://localhost:9000
- **Metagraph L0**: http://localhost:9200 (node 1)
- **Currency L1**: http://localhost:9300 (node 1)
- **Data L1**: http://localhost:9400 (node 1)

## Deployment

### IntegrationNet

1. Build JARs: `cd metagraph && sbt assembly`
2. Upload to servers
3. Configure environment variables
4. Start L0 nodes (3 minimum for consensus)
5. Start L1 nodes
6. Verify: `curl http://[L0-URL]/node/info`

### MainNet

Same process as IntegrationNet, but:
- Test on IntegrationNet for 24+ hours first
- Use production keys and endpoints
- Monitor cluster health closely after launch

## dag4.js Client

```typescript
import dag4 from '@dag4/dag4.js';

const client = dag4.account.createMetagraphTokenClient({
  l0Url: 'http://localhost:9200',
  l1Url: 'http://localhost:9400',
  metagraphId: process.env.METAGRAPH_ID
});

// Submit data update
await client.post('/data-application', {
  type: 'PolicyVersion',
  data: policyVersion
});
```

## Snapshot Queries

```typescript
// Get latest snapshot
const snapshot = await fetch('http://localhost:9200/snapshots/latest')
  .then(r => r.json());

// Get specific snapshot by ordinal
const historicalSnapshot = await fetch('http://localhost:9200/snapshots/42')
  .then(r => r.json());

// Access state
const policyVersions = snapshot.data.policyVersions;
const consentEvents = snapshot.data.consentEvents;
```
