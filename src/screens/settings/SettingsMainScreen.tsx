import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { AuthService } from '../../services/auth/authService';
import { UserService } from '../../services/user/userService';
import { SubscriptionService, Subscription } from '../../services/subscription/subscriptionService';

type SettingItem = {
  label: string;
  screen?: string;
  value?: string | boolean;
  type?: 'coming_soon';
  isPrimary?: boolean;
};

type SettingSection = {
  id: string;
  icon: string;
  title: string;
  directScreen?: string;
  items?: SettingItem[];
};

// Helper function to format date as "Month Year"
const formatMemberSince = (dateString: string | undefined): string => {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return 'Recently';
  }
};

// Helper function to format plan name for display
const formatPlanName = (plan: string | undefined, status: string | undefined): string => {
  if (!plan) return 'Free Plan';
  if (status === 'trialing') {
    return 'Free Trial';
  }
  const planNames: Record<string, string> = {
    weekly: 'Weekly Plan',
    monthly: 'Monthly Plan',
    yearly: 'Annual Plan',
  };
  return planNames[plan] || 'Free Plan';
};

// Helper function to format next billing date
const formatNextBilling = (subscription: Subscription | null): string => {
  if (!subscription) return 'N/A';
  if (subscription.status === 'cancelled') return 'Cancelled';

  // If we have the actual period end date from Stripe, use it
  if (subscription.current_period_end) {
    try {
      const date = new Date(subscription.current_period_end);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      // Fall through to calculation
    }
  }

  // Fallback: Calculate based on plan type and updated_at
  // This handles cases where the webhook didn't update current_period_end
  if (subscription.updated_at && subscription.plan) {
    try {
      const lastUpdate = new Date(subscription.updated_at);
      const now = new Date();

      // Determine billing interval in days
      const intervalDays = subscription.plan === 'weekly' ? 7
        : subscription.plan === 'monthly' ? 30
        : 365; // yearly

      // Calculate next billing date from the last update
      // Keep adding intervals until we're in the future
      let nextBilling = new Date(lastUpdate);
      while (nextBilling <= now) {
        nextBilling.setDate(nextBilling.getDate() + intervalDays);
      }

      return nextBilling.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  }

  return 'N/A';
};

export default function SettingsMainScreen() {
  const navigation = useNavigation<any>();
  const { userData: globalUserData, signOut } = useUser();

  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [memberSince, setMemberSince] = useState<string>('Loading...');
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Fetch user profile and subscription data
  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        try {
          const session = await AuthService.getCurrentSession();
          if (!session?.user?.id) return;

          // Fetch user profile for member since date
          const profile = await UserService.getUserProfile(session.user.id);
          if (profile?.created_at) {
            setMemberSince(formatMemberSince(profile.created_at));
          }

          // Fetch subscription data
          const sub = await SubscriptionService.getSubscription(session.user.id);
          setSubscription(sub);
        } catch (error) {
          console.error('[SettingsMainScreen] Error fetching user data:', error);
        }
      };

      fetchUserData();
    }, [])
  );

  const userData = {
    name: globalUserData.firstName || 'User',
    email: globalUserData.email || 'not set',
    memberSince: memberSince,
    plan: formatPlanName(subscription?.plan, subscription?.status),
    nextBilling: formatNextBilling(subscription),
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Sign out from Supabase
              await AuthService.signOut();

              // Clear local context (auth state listener will handle navigation)
              signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert(
                'Error',
                'Failed to sign out. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };

  const settingsSections: SettingSection[] = [
    {
      id: 'account',
      icon: '👤',
      title: 'Account',
      items: [
        { label: 'Edit Profile', screen: 'EditProfile' },
        { label: 'Change Password', screen: 'ChangePassword' },
      ],
    },
    {
      id: 'subscription',
      icon: '💳',
      title: 'Subscription',
      items: [
        { label: 'Current Plan', value: userData.plan },
        { label: 'Next Billing', value: userData.nextBilling },
        { label: 'Manage Subscription', screen: 'Subscription', isPrimary: true },
      ],
    },
    {
      id: 'preferences',
      icon: '⭐',
      title: 'Your Preferences',
      directScreen: 'YourPreferences',
    },
    {
      id: 'app_preferences',
      icon: '⚙️',
      title: 'App Settings',
      items: [
        { label: 'Metric Units', type: 'coming_soon' },
        { label: 'Language', type: 'coming_soon' },
      ],
    },
    {
      id: 'support',
      icon: '💬',
      title: 'Help & Support',
      directScreen: 'Support',
    },
  ];


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
              <View style={styles.placeholder} />
              <Text style={styles.headerTitle}>Settings</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  {globalUserData.profileImageUri ? (
                    <Image source={{ uri: globalUserData.profileImageUri }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatar}>👤</Text>
                  )}
                  <TouchableOpacity style={styles.editBadge} onPress={() => navigation.navigate('EditProfile')}>
                    <Text style={styles.editIcon}>✏️</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>{userData.name}</Text>
                  <Text style={styles.userEmail}>{userData.email}</Text>
                  <Text style={styles.memberSince}>Member since {userData.memberSince}</Text>
                </View>
              </View>

            </View>

            {/* Settings Menu */}
            <View style={styles.settingsContainer}>
              {settingsSections.map((section, sectionIndex) => (
                <View
                  key={section.id}
                  style={[
                    styles.settingSection,
                    sectionIndex === settingsSections.length - 1 && styles.settingSectionLast,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => {
                      if (section.directScreen) {
                        navigation.navigate(section.directScreen);
                      } else {
                        toggleSection(section.id);
                      }
                    }}
                  >
                    <Text style={styles.sectionIcon}>{section.icon}</Text>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.chevron}>
                      {section.directScreen
                        ? '›'
                        : expandedSections.includes(section.id) ? '⌄' : '›'}
                    </Text>
                  </TouchableOpacity>

                  {!section.directScreen && expandedSections.includes(section.id) && section.items && (
                    <View style={styles.expandedContent}>
                      {section.items.map((item, index) => {
                        const isLastItem = index === section.items!.length - 1;

                        // Primary button (like Manage Subscription)
                        if (item.isPrimary) {
                          return (
                            <TouchableOpacity
                              key={index}
                              style={styles.primaryButton}
                              onPress={() => item.screen && navigation.navigate(item.screen)}
                            >
                              <Text style={styles.primaryButtonText}>{item.label}</Text>
                            </TouchableOpacity>
                          );
                        }

                        // Coming soon badge
                        if (item.type === 'coming_soon') {
                          return (
                            <View key={index} style={[styles.settingRow, isLastItem && styles.settingRowLast]}>
                              <Text style={styles.settingLabel}>{item.label}</Text>
                              <View style={styles.comingSoonBadge}>
                                <Text style={styles.comingSoonText}>Coming Soon</Text>
                              </View>
                            </View>
                          );
                        }

                        // Navigation item with screen
                        if (item.screen) {
                          return (
                            <TouchableOpacity
                              key={index}
                              style={[styles.settingRow, isLastItem && styles.settingRowLast]}
                              onPress={() => navigation.navigate(item.screen)}
                            >
                              <Text style={styles.settingLabel}>{item.label}</Text>
                              <Text style={styles.settingChevron}>
                                {item.value ? `${item.value} ›` : '›'}
                              </Text>
                            </TouchableOpacity>
                          );
                        }

                        // Static value display
                        return (
                          <View key={index} style={[styles.settingRow, isLastItem && styles.settingRowLast]}>
                            <Text style={styles.settingLabel}>{item.label}</Text>
                            <Text style={styles.settingValue}>{item.value}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            {/* App Version */}
            <Text style={styles.versionText}>Loma v1.0.0</Text>
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
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    color: '#1B4332',
    fontFamily: 'PTSerif-Bold',
  },
  placeholder: {
    width: 40,
  },
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    fontSize: 50,
    backgroundColor: '#F3F4F6',
    width: 80,
    height: 80,
    borderRadius: 40,
    textAlign: 'center',
    lineHeight: 80,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1B4332',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    color: '#1B4332',
    marginBottom: 4,
    fontFamily: 'Quicksand-Bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Quicksand-Regular',
  },
  memberSince: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Quicksand-Light',
  },
  settingsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  settingSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingSectionLast: {
    borderBottomWidth: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Quicksand-Bold',
  },
  chevron: {
    fontSize: 20,
    color: '#40916C',
  },
  expandedContent: {
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Quicksand-Regular',
  },
  settingValue: {
    fontSize: 14,
    color: '#40916C',
    fontFamily: 'Quicksand-Regular',
  },
  settingChevron: {
    fontSize: 14,
    color: '#40916C',
  },
  primaryButton: {
    backgroundColor: '#1B4332',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Quicksand-Bold',
  },
  comingSoonBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#40916C',
    fontSize: 12,
    fontFamily: 'Quicksand-Bold',
  },
  signOutButton: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 16,
    fontFamily: 'Quicksand-Bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 40,
    fontFamily: 'Quicksand-Light',
  },
});
