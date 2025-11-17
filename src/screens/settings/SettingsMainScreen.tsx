import React from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';

export default function SettingsMainScreen() {
  const navigation = useNavigation<any>();
  const { userData: globalUserData, clearUserData } = useUser();
  const [expandedSections, setExpandedSections] = React.useState<string[]>([]);

  // Notification settings state
  const [notifications, setNotifications] = React.useState(true);
  const [mealReminders, setMealReminders] = React.useState(true);
  const [weeklyReport, setWeeklyReport] = React.useState(true);

  // App preferences state
  const [darkMode, setDarkMode] = React.useState(false);
  const [metricUnits, setMetricUnits] = React.useState(false);

  const userData = {
    name: globalUserData.firstName || 'User',
    email: globalUserData.email || 'not set',
    memberSince: 'January 2024',
    recipesCooked: globalUserData.totalRecipes,
    currentStreak: globalUserData.currentStreak,
    savedRecipes: globalUserData.savedRecipes.length,
  };

  const toggleSection = (sectionId: string) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter(s => s !== sectionId));
    } else {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };

  const handleSignOut = async () => {
    await clearUserData();
  };

  const settingsSections = [
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
        { label: 'Manage Subscription', screen: 'Subscription' },
        { label: 'Billing History', screen: 'Subscription' },
        { label: 'Payment Method', screen: 'Subscription' },
      ],
    },
    {
      id: 'dietary',
      icon: '🥗',
      title: 'Recipe Preferences',
      directScreen: 'DietaryPreferences',
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
      <LinearGradient
        colors={['#4F46E5', '#2D1B69', '#1A0F3D']}
        style={styles.gradient}
      >
        <StatusBar barStyle="light-content" />
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

            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>👤</Text>
                <TouchableOpacity style={styles.editBadge}>
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
              <Text style={styles.memberSince}>Member since {userData.memberSince}</Text>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userData.recipesCooked}</Text>
                <Text style={styles.statLabel}>Recipes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userData.currentStreak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userData.savedRecipes}</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </View>
            </View>

            {/* Settings Menu */}
            <View style={styles.settingsContainer}>
              {settingsSections.map((section) => (
                <View key={section.id} style={styles.settingSection}>
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
                      {section.items.map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.settingRow}
                          onPress={() => navigation.navigate(item.screen)}
                        >
                          <Text style={styles.settingLabel}>{item.label}</Text>
                          <Text style={styles.settingChevron}>›</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              {/* Notifications Section */}
              <View style={styles.settingSection}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection('notifications')}
                >
                  <Text style={styles.sectionIcon}>🔔</Text>
                  <Text style={styles.sectionTitle}>Notifications</Text>
                  <Text style={styles.chevron}>
                    {expandedSections.includes('notifications') ? '⌄' : '›'}
                  </Text>
                </TouchableOpacity>

                {expandedSections.includes('notifications') && (
                  <View style={styles.expandedContent}>
                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Push Notifications</Text>
                      <Switch
                        value={notifications}
                        onValueChange={setNotifications}
                        trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                        thumbColor="white"
                      />
                    </View>
                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Meal Reminders</Text>
                      <Switch
                        value={mealReminders}
                        onValueChange={setMealReminders}
                        trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                        thumbColor="white"
                      />
                    </View>
                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Weekly Report</Text>
                      <Switch
                        value={weeklyReport}
                        onValueChange={setWeeklyReport}
                        trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                        thumbColor="white"
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.settingRow}
                      onPress={() => navigation.navigate('NotificationSettings')}
                    >
                      <Text style={styles.settingLabel}>Notification Schedule</Text>
                      <Text style={styles.settingChevron}>›</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* App Preferences Section */}
              <View style={styles.settingSection}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection('preferences')}
                >
                  <Text style={styles.sectionIcon}>⚙️</Text>
                  <Text style={styles.sectionTitle}>App Preferences</Text>
                  <Text style={styles.chevron}>
                    {expandedSections.includes('preferences') ? '⌄' : '›'}
                  </Text>
                </TouchableOpacity>

                {expandedSections.includes('preferences') && (
                  <View style={styles.expandedContent}>
                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Dark Mode</Text>
                      <Switch
                        value={darkMode}
                        onValueChange={setDarkMode}
                        trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                        thumbColor="white"
                      />
                    </View>
                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Metric Units</Text>
                      <Switch
                        value={metricUnits}
                        onValueChange={setMetricUnits}
                        trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                        thumbColor="white"
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.settingRow}
                      onPress={() => navigation.navigate('AppPreferences')}
                    >
                      <Text style={styles.settingLabel}>Language</Text>
                      <Text style={styles.settingValue}>English ›</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            {/* App Version */}
            <Text style={styles.versionText}>Loma v1.0.0</Text>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
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
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 100,
    height: 100,
    borderRadius: 50,
    textAlign: 'center',
    lineHeight: 100,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  settingsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  settingSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  expandedContent: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  settingValue: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  settingChevron: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  signOutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginBottom: 40,
  },
});
