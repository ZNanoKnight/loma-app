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
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { AuthService } from '../../services/auth/authService';
import { LocalStorage } from '../../services/storage/asyncStorage';

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
  const { userData: globalUserData, signOut } = useUser();

  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [metricUnits, setMetricUnits] = useState(globalUserData.metricUnits ?? false);

  const userData = {
    name: globalUserData.firstName || 'User',
    email: globalUserData.email || 'not set',
    memberSince: 'January 2024',
    plan: 'Free Plan',
    nextBilling: 'N/A',
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

                        // Switch toggle
                        if (item.type === 'switch' && typeof item.value === 'boolean' && item.onChange) {
                          return (
                            <View key={index} style={[styles.settingRow, isLastItem && styles.settingRowLast]}>
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
    color: '#000000',
    fontFamily: 'Quicksand-Bold',
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
    fontFamily: 'Quicksand-Regular',
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
    backgroundColor: '#6B46C1',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
  },
  userName: {
    fontSize: 20,
    color: '#000000',
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
    fontFamily: 'Quicksand-Regular',
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
    fontFamily: 'Quicksand-Regular',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Quicksand-SemiBold',
  },
  chevron: {
    fontSize: 20,
    color: '#6B46C1',
    fontFamily: 'Quicksand-Regular',
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
    color: '#6B46C1',
    fontFamily: 'Quicksand-Regular',
  },
  settingChevron: {
    fontSize: 14,
    color: '#6B46C1',
    fontFamily: 'Quicksand-Regular',
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
    fontFamily: 'Quicksand-SemiBold',
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
    fontFamily: 'Quicksand-SemiBold',
  },
  versionText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 40,
    fontFamily: 'Quicksand-Regular',
  },
});
