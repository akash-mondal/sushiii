import { ProofBundle, ConsentEvent, SnapshotRef } from '../types/index.js';
import { hgtpClient } from './hgtp-client.js';

class ProofBundler {
  private readonly l0Url: string;
  private bundles: Map<string, ProofBundle> = new Map();

  constructor() {
    this.l0Url = process.env.METAGRAPH_L0_URL || 'http://localhost:9200';
  }

  async generateBundle(subjectId: string): Promise<ProofBundle> {
    const consents = await hgtpClient.getConsentsBySubject(subjectId);

    const snapshotRefs = await this.getSnapshotRefs();

    const bundle: ProofBundle = {
      subject_id: subjectId,
      consents,
      snapshot_refs: snapshotRefs,
      generated_at: new Date().toISOString(),
      signature: this.generateSignature(subjectId, consents, snapshotRefs),
    };

    const bundleId = this.generateBundleId(bundle);
    this.bundles.set(bundleId, bundle);

    return bundle;
  }

  async getBundle(bundleId: string): Promise<ProofBundle | null> {
    return this.bundles.get(bundleId) || null;
  }

  private async getSnapshotRefs(): Promise<SnapshotRef[]> {
    try {
      const response = await fetch(`${this.l0Url}/snapshots/latest`);
      if (!response.ok) {
        return [];
      }

      const snapshot = await response.json();
      return [
        {
          ordinal: snapshot.ordinal || 0,
          hash: snapshot.hash || '',
          timestamp: snapshot.timestamp || new Date().toISOString(),
        },
      ];
    } catch (error) {
      console.error('Error fetching snapshot refs:', error);
      return [];
    }
  }

  private generateSignature(
    subjectId: string,
    consents: ConsentEvent[],
    snapshotRefs: SnapshotRef[]
  ): string {
    const data = JSON.stringify({ subjectId, consents, snapshotRefs });
    return Buffer.from(data).toString('base64');
  }

  private generateBundleId(bundle: ProofBundle): string {
    return `${bundle.subject_id}-${Date.now()}`;
  }
}

export const proofBundler = new ProofBundler();
