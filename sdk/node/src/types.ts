export interface PolicyVersion {
  policy_id: string;
  version: string;
  content_hash: string;
  uri: string;
  jurisdiction: string;
  effective_from: string;
}

export interface PolicyRef {
  policy_id: string;
  version: string;
}

export interface ConsentEvent {
  subject_id: string;
  policy_ref: PolicyRef;
  event_type: 'granted' | 'revoked' | 'updated';
  timestamp: string;
}

export interface SushiiiConfig {
  apiUrl: string;
  apiKey: string;
}
