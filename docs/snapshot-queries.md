# Snapshot Queries

## Overview

Constellation metagraphs store state as a series of snapshots. Each snapshot represents the state at a specific point in time.

## Snapshot Structure

```typescript
{
  ordinal: number;           // Sequential snapshot number
  hash: string;              // SHA-256 hash of snapshot
  timestamp: string;         // ISO 8601 timestamp
  data: CalculatedState;     // Application state
  validators: string[];      // Validator signatures
}
```

## Query Endpoints

### Latest Snapshot

```bash
curl http://localhost:9200/snapshots/latest
```

Returns the most recent finalized snapshot with current state.

### Historical Snapshot

```bash
curl http://localhost:9200/snapshots/{ordinal}
```

Returns a specific snapshot by ordinal number.

### Snapshot Range

```bash
curl http://localhost:9200/snapshots?from=10&to=20
```

Returns snapshots in the specified range.

## State Queries

### Get All Policies

```typescript
const snapshot = await fetch('http://localhost:9200/snapshots/latest')
  .then(r => r.json());

const policies = Object.values(snapshot.data.policyVersions);
```

### Get Consents for Subject

```typescript
const snapshot = await fetch('http://localhost:9200/snapshots/latest')
  .then(r => r.json());

const subjectConsents = snapshot.data.consentEvents
  .filter(c => c.subject_id === hashedSubjectId);
```

### Time-Based Queries

Find state at a specific time by querying snapshots with timestamps:

```typescript
async function getStateAtTime(targetTime: string) {
  let ordinal = 0;
  while (true) {
    const snapshot = await fetch(`http://localhost:9200/snapshots/${ordinal}`)
      .then(r => r.json());

    if (snapshot.timestamp >= targetTime) {
      return snapshot.data;
    }
    ordinal++;
  }
}
```

## Pagination

For subjects with many consent events:

```typescript
const PAGE_SIZE = 100;

function paginateConsents(allConsents: ConsentEvent[], page: number) {
  const start = page * PAGE_SIZE;
  return allConsents.slice(start, start + PAGE_SIZE);
}
```

## Caching Considerations

- Latest snapshot changes every ~10 seconds
- Historical snapshots are immutable
- Cache historical snapshots indefinitely
- Cache latest snapshot with short TTL (5-10s)
