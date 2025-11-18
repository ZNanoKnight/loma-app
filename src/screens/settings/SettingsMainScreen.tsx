import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';

type SettingItem = {
  label: string;
  screen?: string;
  value?: string | boolean;
  type?: 'switch';
  onChange?: (value: boolean) => void;
  isPrimary?: boolean;
};

type SettingSection = {
  id: string;
  icon: string;
  title: string;
  directScreen?: string;
  items?: SettingItem[];
};

export default function SettingsMainScreen() {
  const navigation = useNavigation<any>();
  const { userData: globalUserData, clearUserData } = useUser();

  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(false);
  const [mealReminders, setMealReminders] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [metricUnits, setMetricUnits] = useState(false);

  const userData = {
    name: globalUserData.firstName || 'User',
    email: globalUserData.email || 'not set',
    memberSince: 'January 2024',
    recipesCooked: globalUserData.totalRecipes,
    currentStreak: globalUserData.currentStreak,
    savedRecipes: globalUserData.savedRecipes.length,
    plan: 'Free Plan',
    nextBilling: 'N/A',
  };

  const handleSignOut = async () => {
    await clearUserData();
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
        { label: 'Privacy Settings', screen: 'AccountSettings' },
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
      id: 'notifications',
      icon: '🔔',
      title: 'Notifications',
      items: [
        { label: 'Push Notifications', type: 'switch', value: notifications, onChange: setNotifications },
        { label: 'Meal Reminders', type: 'switch', value: mealReminders, onChange: setMealReminders },
        { label: 'Weekly Report', type: 'switch', value: weeklyReport, onChange: setWeeklyReport },
      ],
    },
    {
      id: 'dietary',
      icon: '🥗',
      title: 'Recipe Preferences',
      directScreen: 'DietaryPreferences',
    },
    {
      id: 'preferences',
      icon: '⚙️',
      title: 'App Preferences',
      items: [
        { label: 'Dark Mode', type: 'switch', value: darkMode, onChange: setDarkMode },
        { label: 'Metric Units', type: 'switch', value: metricUnits, onChange: setMetricUnits },
        { label: 'Language', screen: 'AppPreferences', value: 'English' },
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
                  <Text style={styles.avatar}>👤</Text>
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

              {/* Stats Summary */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statEmoji}>📚</Text>
                  <Text style={styles.statNumber}>{userData.recipesCooked}</Text>
                  <Text style={styles.statLabel}>Recipes</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCard}>
                  <Text style={styles.statEmoji}>🔥</Text>
                  <Text style={styles.statNumber}>{userData.currentStreak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCard}>
                  <Text style={styles.statEmoji}>❤️</Text>
                  <Text style={styles.statNumber}>{userData.savedRecipes}</Text>
                  <Text style={styles.statLabel}>Saved</Text>
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

                        // Switch toggle
                        if (item.type === 'switch' && typeof item.value === 'boolean' && item.onChange) {
                          return (
                            <View key={index} style={styles.settingRow}>
                              <Text style={styles.settingLabel}>{item.label}</Text>
                              <Switch
                                value={item.value}
                                onValueChange={item.onChange}
                                trackColor={{ false: '#E5E7EB', true: '#6B46C1' }}
                                thumbColor="white"
                              />
                            </View>
                          );
                        }

                        // Navigation item with screen
                        if (item.screen) {
                          return (
                            <TouchableOpacity
                              key={index}
                              style={styles.settingRow}
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
                          <View key={index} style={styles.settingRow}>
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
    color: '#000000',
    fontFamily: 'VendSans-Bold',
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
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    fontFamily: 'VendSans-Regular',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6B46C1',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 14,
    fontFamily: 'VendSans-Regular',
  },
  userName: {
    fontSize: 20,
    color: '#000000',
    marginBottom: 4,
    fontFamily: 'VendSans-Bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'VendSans-Regular',
  },
  memberSince: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'VendSans-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
    fontFamily: 'VendSans-Regular',
  },
  statNumber: {
    fontSize: 24,
    color: '#6B46C1',
    marginBottom: 2,
    fontFamily: 'VendSans-Bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'VendSans-Regular',
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
    fontFamily: 'VendSans-Regular',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'VendSans-SemiBold',
  },
  chevron: {
    fontSize: 20,
    color: '#6B46C1',
    fontFamily: 'VendSans-Regular',
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
  settingLabel: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'VendSans-Regular',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B46C1',
    fontFamily: 'VendSans-Regular',
  },
  settingChevron: {
    fontSize: 14,
    color: '#6B46C1',
    fontFamily: 'VendSans-Regular',
  },
  primaryButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'VendSans-SemiBold',
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
    fontFamily: 'VendSans-SemiBold',
  },
  versionText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 40,
    fontFamily: 'VendSans-Regular',
  },
});
