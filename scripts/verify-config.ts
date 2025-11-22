/**
 * Configuration Verification Script
 * Run this script to verify all services are properly configured
 *
 * Usage:
 * npx ts-node scripts/verify-config.ts
 */

import { ConfigVerification } from '../src/utils/configVerification';

async function main() {
  try {
    const { summary } = await ConfigVerification.runAllChecks();

    // Exit with error code if any checks failed
    process.exit(summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error during verification:', error);
    process.exit(1);
  }
}

main();
