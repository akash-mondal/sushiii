export interface ProofBundle {
  subject_id: string;
  consents: ConsentEvent[];
  snapshot_refs: SnapshotRef[];
  generated_at: string;
  signature: string;
}

export interface ConsentEvent {
  subject_id: string;
  policy_ref: PolicyRef;
  event_type: 'granted' | 'revoked' | 'updated';
  timestamp: string;
  captured_at: string;
}

export interface PolicyRef {
  policy_id: string;
  version: string;
}

export interface SnapshotRef {
  ordinal: number;
  hash: string;
  timestamp: string;
}

export interface VerificationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
