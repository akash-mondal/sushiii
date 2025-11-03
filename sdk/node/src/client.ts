import { PolicyVersion, ConsentEvent, SushiiiConfig } from './types.js';

export class SushiiiClient {
  private config: SushiiiConfig;

  constructor(config: SushiiiConfig) {
    this.config = config;
  }

  async createPolicy(policy: PolicyVersion): Promise<{ success: boolean; hash?: string }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify(policy),
      });

      if (!response.ok) {
        throw new Error(`Policy creation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, hash: result.transaction_hash };
    } catch (error) {
      console.error('Error creating policy:', error);
      return { success: false };
    }
  }

  async batchSubmitConsents(consents: ConsentEvent[]): Promise<{ success: boolean; count: number }> {
    let successCount = 0;

    for (const consent of consents) {
      try {
        const response = await fetch(`${this.config.apiUrl}/api/consents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey,
          },
          body: JSON.stringify(consent),
        });

        if (response.ok) {
          successCount++;
        }
      } catch (error) {
        console.error('Error submitting consent:', error);
      }
    }

    return { success: successCount === consents.length, count: successCount };
  }

  async getPolicies(): Promise<PolicyVersion[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/policies`, {
        headers: {
          'X-API-Key': this.config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch policies: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching policies:', error);
      return [];
    }
  }
}
