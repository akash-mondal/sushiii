import { PolicyVersion, ConsentEvent } from '../types/index.js';

class HGTPClient {
  private readonly l0Url: string;
  private readonly l1Url: string;
  private readonly metagraphId: string;

  constructor() {
    this.l0Url = process.env.METAGRAPH_L0_URL || 'http://localhost:9200';
    this.l1Url = process.env.METAGRAPH_L1_URL || 'http://localhost:9400';
    this.metagraphId = process.env.METAGRAPH_ID || '';
  }

  async submitPolicyVersion(policyVersion: PolicyVersion): Promise<{ hash: string }> {
    try {
      const response = await fetch(`${this.l1Url}/data-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'PolicyVersion',
          data: policyVersion,
        }),
      });

      if (!response.ok) {
        throw new Error(`HGTP submission failed: ${response.statusText}`);
      }

      const result = await response.json();
      return { hash: result.hash || 'pending' };
    } catch (error) {
      console.error('Error submitting policy version:', error);
      throw error;
    }
  }

  async submitConsentEvent(consentEvent: ConsentEvent): Promise<{ hash: string }> {
    try {
      const response = await fetch(`${this.l1Url}/data-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ConsentEvent',
          data: consentEvent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HGTP submission failed: ${response.statusText}`);
      }

      const result = await response.json();
      return { hash: result.hash || 'pending' };
    } catch (error) {
      console.error('Error submitting consent event:', error);
      throw error;
    }
  }

  async getPolicies(): Promise<PolicyVersion[]> {
    try {
      const response = await fetch(`${this.l0Url}/snapshots/latest`);
      if (!response.ok) {
        throw new Error(`Failed to fetch policies: ${response.statusText}`);
      }

      const snapshot = await response.json();
      return Object.values(snapshot.data?.policyVersions || {});
    } catch (error) {
      console.error('Error fetching policies:', error);
      return [];
    }
  }

  async getPolicy(policyId: string): Promise<PolicyVersion | null> {
    const policies = await this.getPolicies();
    return policies.find((p) => p.policy_id === policyId) || null;
  }

  async getConsentsBySubject(subjectId: string): Promise<ConsentEvent[]> {
    try {
      const response = await fetch(`${this.l0Url}/snapshots/latest`);
      if (!response.ok) {
        throw new Error(`Failed to fetch consents: ${response.statusText}`);
      }

      const snapshot = await response.json();
      const allConsents: ConsentEvent[] = snapshot.data?.consentEvents || [];
      return allConsents.filter((c) => c.subject_id === subjectId);
    } catch (error) {
      console.error('Error fetching consents:', error);
      return [];
    }
  }
}

export const hgtpClient = new HGTPClient();
