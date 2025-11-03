# HGTP Integration Guide

## Overview

HGTP (Hypergraph Transfer Protocol) is the protocol for submitting data updates to Constellation metagraphs.

## Client Configuration

```typescript
const hgtpClient = new HGTPClient({
  l0Url: 'http://localhost:9200',
  l1Url: 'http://localhost:9400',
  metagraphId: process.env.METAGRAPH_ID
});
```

## Submitting Updates

### Policy Version

```typescript
await hgtpClient.submitPolicyVersion({
  policy_id: 'privacy-policy',
  version: '1.0.0',
  content_hash: 'abc123...',
  uri: 'https://example.com/privacy',
  jurisdiction: 'US',
  effective_from: '2024-01-01T00:00:00Z',
  created_at: new Date().toISOString()
});
```

### Consent Event

```typescript
await hgtpClient.submitConsentEvent({
  subject_id: 'hashed-subject-id',
  policy_ref: { policy_id: 'privacy-policy', version: '1.0.0' },
  event_type: 'granted',
  timestamp: new Date().toISOString(),
  captured_at: new Date().toISOString()
});
```

## Error Handling

- **ValidationError**: Data L1 validator rejected the update
- **NetworkError**: Connection to metagraph failed
- **TimeoutError**: Request exceeded timeout threshold

## Retry Strategy

The HGTP client implements exponential backoff with:
- Initial delay: 1s
- Max retries: 3
- Backoff multiplier: 2x

## Troubleshooting

### "Node not ready"
Data L1 node is still syncing. Wait and retry.

### "Validation failed"
Check validator logic in `metagraph/shared/src/main/scala/.../validations/`

### "Snapshot not found"
Metagraph L0 is behind. Verify cluster health with `/cluster/info`
