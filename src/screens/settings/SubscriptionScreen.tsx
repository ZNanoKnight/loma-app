import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SubscriptionService, Subscription } from '../../services/subscription/subscriptionService';
import { AuthService } from '../../services/auth/authService';

export default function SubscriptionScreen() {
  const navigation = useNavigation<any>();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const session = await AuthService.getSession();
      if (session?.user?.id) {
        const sub = await SubscriptionService.getSubscription(session.user.id);
        setSubscription(sub);
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      Alert.alert('Error', 'Failed to load subscription details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const session = await AuthService.getSession();
      if (!session?.user?.id) {
        throw new Error('No active session');
      }

      const portalUrl = await SubscriptionService.getCustomerPortalUrl(session.user.id);

      // Open Stripe Customer Portal in browser
      const supported = await Linking.canOpenURL(portalUrl);
      if (supported) {
        await Linking.openURL(portalUrl);
      } else {
        Alert.alert('Error', 'Unable to open subscription management.');
      }
    } catch (error: any) {
      console.error('Error opening portal:', error);
      Alert.alert('Error', error.userMessage || 'Failed to open subscription management.');
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription?',
      'Are you sure you want to cancel your subscription? You\'ll keep access until the end of your billing period.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: confirmCancellation,
        },
      ]
    );
  };

  const confirmCancellation = async () => {
    try {
      setCancelling(true);
      const session = await AuthService.getSession();
      if (!session?.user?.id) {
        throw new Error('No active session');
      }

      // For proper cancellation, redirect to Stripe Customer Portal
      // This ensures the cancellation is handled correctly by Stripe
      await handleManageSubscription();

      Alert.alert(
        'Manage Subscription',
        'Please use the Stripe portal to cancel your subscription. This ensures your cancellation is processed correctly.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      Alert.alert('Error', error.userMessage || 'Failed to cancel subscription.');
    } finally {
      setCancelling(false);
    }
  };

  const getPlanName = (sub: Subscription | null): string => {
    if (!sub) return 'No Plan';

    // Determine plan based on price ID or tokens
    if (sub.tokens_total === 5) return 'Weekly Plan';
    if (sub.tokens_total === 20) return 'Monthly Plan';
    if (sub.tokens_total === 240) return 'Yearly Plan';

    return 'Subscription';
  };

  const getPlanPrice = (sub: Subscription | null): string => {
    if (!sub) return '$0.00';

    if (sub.tokens_total === 5) return '$3.99/week';
    if (sub.tokens_total === 20) return '$7.99/month';
    if (sub.tokens_total === 240) return '$48.99/year';

    return 'Custom Plan';
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
      case 'trialing':
        return '#10B981';
      case 'past_due':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active':
        return 'ACTIVE';
      case 'trialing':
        return 'TRIAL';
      case 'past_due':
        return 'PAST DUE';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status.toUpperCase();
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6B46C1" />
        <Text style={styles.loadingText}>Loading subscription...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Subscription</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Current Plan */}
            <View style={styles.planCard}>
              <View style={[styles.planBadge, { backgroundColor: getStatusColor(subscription?.status || 'active') }]}>
                <Text style={styles.planBadgeText}>{getStatusLabel(subscription?.status || 'active')}</Text>
              </View>
              <Text style={styles.planTitle}>{getPlanName(subscription)}</Text>
              <Text style={styles.planPrice}>{getPlanPrice(subscription)}</Text>
              <Text style={styles.planDescription}>
                🍪 {subscription?.tokens_balance || 0} Munchies remaining of {subscription?.tokens_total || 0} total
              </Text>
              <Text style={styles.planUsage}>
                Used {subscription?.tokens_used || 0} Munchies so far
              </Text>
            </View>

            {/* Billing Information */}
            <View style={styles.settingsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Billing Information</Text>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>
                  {subscription?.status === 'cancelled' ? 'Access Until' : 'Next Billing Date'}
                </Text>
                <Text style={styles.settingValue}>
                  {formatDate(subscription?.current_period_end || null)}
                </Text>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Subscription Start</Text>
                <Text style={styles.settingValue}>
                  {formatDate(subscription?.created_at || null)}
                </Text>
              </View>

              {subscription?.cancelled_at && (
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Cancelled On</Text>
                  <Text style={[styles.settingValue, { color: '#EF4444' }]}>
                    {formatDate(subscription.cancelled_at)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.settingRow}
                onPress={handleManageSubscription}
              >
                <Text style={styles.settingLabel}>Manage via Stripe</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleManageSubscription}
              >
                <Text style={styles.primaryButtonText}>Manage Subscription</Text>
              </TouchableOpacity>

              {subscription?.status !== 'cancelled' && (
                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={handleCancelSubscription}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <ActivityIndicator color="#EF4444" />
                  ) : (
                    <Text style={styles.dangerButtonText}>Cancel Subscription</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#1F2937',
    fontSize: 24,
    fontFamily: 'Quicksand-Regular',
  },
  headerTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontFamily: 'Quicksand-SemiBold',
  },
  placeholder: {
    width: 40,
  },
  planCard: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  planBadge: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  planBadgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Quicksand-Bold',
  },
  planTitle: {
    fontSize: 24,
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Quicksand-Bold',
  },
  planPrice: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 12,
    fontFamily: 'Quicksand-Regular',
  },
  planDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Quicksand-Regular',
  },
  planUsage: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Quicksand-Regular',
  },
  settingsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Quicksand-SemiBold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Quicksand-Medium',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 8,
    fontFamily: 'Quicksand-Regular',
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
    fontFamily: 'Quicksand-Regular',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dangerButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
  },
});
