/**
 * Configuration Verification Utility
 * Tests and verifies all services are properly configured
 */

import { ENV, validateEnv, checkOptionalEnv } from '../config/env';
import { isSupabaseConfigured, getSupabaseClient } from '../services/auth/supabase';
import { SecureStorage, LocalStorage } from '../services/storage';

export interface VerificationResult {
  category: string;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
  }[];
}

export const ConfigVerification = {
  /**
   * Verify environment variables are set
   */
  async verifyEnvironment(): Promise<VerificationResult> {
    const checks: VerificationResult['checks'] = [];

    // Check Supabase credentials
    checks.push({
      name: 'Supabase URL',
      status: ENV.SUPABASE_URL ? 'pass' : 'fail',
      message: ENV.SUPABASE_URL
        ? `Configured: ${ENV.SUPABASE_URL}`
        : 'Missing SUPABASE_URL in .env file',
    });

    checks.push({
      name: 'Supabase Anon Key',
      status: ENV.SUPABASE_ANON_KEY ? 'pass' : 'fail',
      message: ENV.SUPABASE_ANON_KEY
        ? `Configured (${ENV.SUPABASE_ANON_KEY.substring(0, 20)}...)`
        : 'Missing SUPABASE_ANON_KEY in .env file',
    });

    // Check optional environment variables
    checks.push({
      name: 'OpenAI API Key',
      status: ENV.OPENAI_API_KEY ? 'pass' : 'warning',
      message: ENV.OPENAI_API_KEY
        ? 'Configured (ready for Phase 3)'
        : 'Not configured (will be needed for Phase 3 - AI Recipe Generation)',
    });

    checks.push({
      name: 'Stripe Publishable Key',
      status: ENV.STRIPE_PUBLISHABLE_KEY ? 'pass' : 'warning',
      message: ENV.STRIPE_PUBLISHABLE_KEY
        ? 'Configured (ready for Phase 2)'
        : 'Not configured (will be needed for Phase 2 - Payments)',
    });

    checks.push({
      name: 'Sentry DSN',
      status: ENV.SENTRY_DSN ? 'pass' : 'warning',
      message: ENV.SENTRY_DSN
        ? 'Configured (error tracking enabled)'
        : 'Not configured (error tracking disabled)',
    });

    checks.push({
      name: 'API Timeout',
      status: ENV.API_TIMEOUT > 0 ? 'pass' : 'warning',
      message: `Set to ${ENV.API_TIMEOUT}ms`,
    });

    checks.push({
      name: 'Environment Mode',
      status: ENV.NODE_ENV === 'development' ? 'pass' : 'warning',
      message: `Running in ${ENV.NODE_ENV} mode`,
    });

    return {
      category: 'Environment Variables',
      checks,
    };
  },

  /**
   * Verify Supabase connection
   */
  async verifySupabase(): Promise<VerificationResult> {
    const checks: VerificationResult['checks'] = [];

    // Check if Supabase is configured
    const configured = isSupabaseConfigured();
    checks.push({
      name: 'Supabase Client Initialization',
      status: configured ? 'pass' : 'fail',
      message: configured
        ? 'Supabase client successfully initialized'
        : 'Supabase client failed to initialize',
    });

    if (!configured) {
      return {
        category: 'Supabase Connection',
        checks,
      };
    }

    // Try to get the client
    try {
      const supabase = getSupabaseClient();
      checks.push({
        name: 'Get Supabase Client',
        status: 'pass',
        message: 'Successfully retrieved Supabase client',
      });

      // Test connection by checking session
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        checks.push({
          name: 'Supabase Connection Test',
          status: 'pass',
          message: session
            ? `Connected (authenticated as ${session.user.email})`
            : 'Connected (no active session)',
        });
      } catch (error) {
        checks.push({
          name: 'Supabase Connection Test',
          status: 'warning',
          message: `Connection test inconclusive: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }

      // Test database access
      try {
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
        if (error) {
          checks.push({
            name: 'Database Schema Check',
            status: 'fail',
            message: `Failed to query user_profiles table: ${error.message}. Have you run the schema.sql file?`,
          });
        } else {
          checks.push({
            name: 'Database Schema Check',
            status: 'pass',
            message: 'Database tables are accessible',
          });
        }
      } catch (error) {
        checks.push({
          name: 'Database Schema Check',
          status: 'fail',
          message: `Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    } catch (error) {
      checks.push({
        name: 'Get Supabase Client',
        status: 'fail',
        message: `Failed to get Supabase client: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    return {
      category: 'Supabase Connection',
      checks,
    };
  },

  /**
   * Verify storage services
   */
  async verifyStorage(): Promise<VerificationResult> {
    const checks: VerificationResult['checks'] = [];

    // Test SecureStorage
    try {
      const testKey = 'test_verification_key';
      const testValue = 'test_value';

      // Try to write
      await SecureStorage.setItem(testKey, testValue);
      checks.push({
        name: 'Secure Storage Write',
        status: 'pass',
        message: 'Successfully wrote to secure storage',
      });

      // Try to read
      const retrieved = await SecureStorage.getItem(testKey);
      if (retrieved === testValue) {
        checks.push({
          name: 'Secure Storage Read',
          status: 'pass',
          message: 'Successfully read from secure storage',
        });
      } else {
        checks.push({
          name: 'Secure Storage Read',
          status: 'fail',
          message: 'Read value does not match written value',
        });
      }

      // Clean up
      await SecureStorage.removeItem(testKey);
    } catch (error) {
      checks.push({
        name: 'Secure Storage',
        status: 'fail',
        message: `Secure storage error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // Test AsyncStorage
    try {
      const testKey = '@test_verification_key';
      const testValue = { test: 'data' };

      // Try to write
      await LocalStorage.setItem(testKey, testValue);
      checks.push({
        name: 'Local Storage Write',
        status: 'pass',
        message: 'Successfully wrote to local storage',
      });

      // Try to read
      const retrieved = await LocalStorage.getItem(testKey);
      if (retrieved && JSON.stringify(retrieved) === JSON.stringify(testValue)) {
        checks.push({
          name: 'Local Storage Read',
          status: 'pass',
          message: 'Successfully read from local storage',
        });
      } else {
        checks.push({
          name: 'Local Storage Read',
          status: 'fail',
          message: 'Read value does not match written value',
        });
      }

      // Clean up
      await LocalStorage.removeItem(testKey);
    } catch (error) {
      checks.push({
        name: 'Local Storage',
        status: 'fail',
        message: `Local storage error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    return {
      category: 'Storage Services',
      checks,
    };
  },

  /**
   * Run all verification checks
   */
  async runAllChecks(): Promise<{
    results: VerificationResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      warnings: number;
    };
  }> {
    console.log('🔍 Running configuration verification...\n');

    const results: VerificationResult[] = [];

    // Run all checks
    results.push(await this.verifyEnvironment());
    results.push(await this.verifySupabase());
    results.push(await this.verifyStorage());

    // Calculate summary
    let total = 0;
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    results.forEach((result) => {
      result.checks.forEach((check) => {
        total++;
        if (check.status === 'pass') passed++;
        if (check.status === 'fail') failed++;
        if (check.status === 'warning') warnings++;
      });
    });

    // Print results
    results.forEach((result) => {
      console.log(`\n${result.category}:`);
      console.log('─'.repeat(50));
      result.checks.forEach((check) => {
        const icon =
          check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
        console.log(`${icon} ${check.name}: ${check.message}`);
      });
    });

    console.log('\n' + '='.repeat(50));
    console.log('Summary:');
    console.log(`Total Checks: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log('='.repeat(50) + '\n');

    if (failed > 0) {
      console.log('❌ Configuration verification failed!');
      console.log('Please fix the failed checks above before proceeding.\n');
    } else if (warnings > 0) {
      console.log('⚠️  Configuration verification passed with warnings.');
      console.log('Some optional features are not configured.\n');
    } else {
      console.log('✅ All configuration checks passed!\n');
    }

    return {
      results,
      summary: { total, passed, failed, warnings },
    };
  },
};
