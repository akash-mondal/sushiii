export interface PolicyRef {
  policy_id: string;
  version: string;
}

export interface ConsentCapture {
  subject_id: string;
  policy_ref: PolicyRef;
  event_type: 'granted' | 'revoked' | 'updated';
}

export interface SushiiiConfig {
  apiUrl: string;
  apiKey: string;
}
