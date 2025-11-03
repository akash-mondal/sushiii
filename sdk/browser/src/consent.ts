import { ConsentCapture, SushiiiConfig } from './types.js';

export class SushiiiClient {
  private config: SushiiiConfig;

  constructor(config: SushiiiConfig) {
    this.config = config;
  }

  async captureConsent(consent: ConsentCapture): Promise<{ success: boolean; hash?: string }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/consents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify({
          ...consent,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Consent capture failed: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, hash: result.transaction_hash };
    } catch (error) {
      console.error('Error capturing consent:', error);
      return { success: false };
    }
  }

  async getConsents(subjectId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/api/consents/subject/${subjectId}`,
        {
          headers: {
            'X-API-Key': this.config.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch consents: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching consents:', error);
      return [];
    }
  }
}
