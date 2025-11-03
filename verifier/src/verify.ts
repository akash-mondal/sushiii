import { ProofBundle, VerificationResult } from './types.js';

export class ProofVerifier {
  private metagraphL0Url: string;

  constructor(metagraphL0Url: string) {
    this.metagraphL0Url = metagraphL0Url;
  }

  async verifyBundle(bundle: ProofBundle): Promise<VerificationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!bundle.subject_id || bundle.subject_id.length !== 64) {
      errors.push('Invalid subject_id format');
    }

    if (!bundle.signature) {
      errors.push('Missing signature');
    }

    if (!bundle.snapshot_refs || bundle.snapshot_refs.length === 0) {
      errors.push('No snapshot references found');
    }

    if (!this.verifySignature(bundle)) {
      errors.push('Invalid signature');
    }

    for (const snapshotRef of bundle.snapshot_refs) {
      const isValid = await this.verifySnapshotRef(snapshotRef);
      if (!isValid) {
        warnings.push(`Snapshot ${snapshotRef.ordinal} could not be verified`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private verifySignature(bundle: ProofBundle): boolean {
    try {
      const data = JSON.stringify({
        subjectId: bundle.subject_id,
        consents: bundle.consents,
        snapshotRefs: bundle.snapshot_refs,
      });
      const expectedSignature = Buffer.from(data).toString('base64');
      return bundle.signature === expectedSignature;
    } catch (error) {
      return false;
    }
  }

  private async verifySnapshotRef(snapshotRef: { ordinal: number; hash: string }): Promise<boolean> {
    try {
      const response = await fetch(`${this.metagraphL0Url}/snapshots/${snapshotRef.ordinal}`);
      if (!response.ok) {
        return false;
      }

      const snapshot = await response.json();
      return snapshot.hash === snapshotRef.hash;
    } catch (error) {
      return false;
    }
  }
}
