import React, { useState, useEffect } from 'react';
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

export default function NotificationSettingsScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();

  const [notifications, setNotifications] = useState(userData.notifications);
  const [mealReminders, setMealReminders] = useState(userData.mealReminders);
  const [weeklyReport, setWeeklyReport] = useState(userData.weeklyReport);

  // Update global state when settings change
  useEffect(() => {
    updateUserData({
      notifications,
      mealReminders,
      weeklyReport,
    });
  }, [notifications, mealReminders, weeklyReport]);

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
              <Text style={styles.headerTitle}>Notifications</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Settings Content */}
            <View style={styles.settingsContainer}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive notifications about your recipes and cooking
                  </Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#E5E7EB', true: '#6B46C1' }}
                  thumbColor="white"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Meal Reminders</Text>
                  <Text style={styles.settingDescription}>
                    Get reminded when it's time to cook your planned meals
                  </Text>
                </View>
                <Switch
                  value={mealReminders}
                  onValueChange={setMealReminders}
                  trackColor={{ false: '#E5E7EB', true: '#6B46C1' }}
                  thumbColor="white"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Weekly Report</Text>
                  <Text style={styles.settingDescription}>
                    Receive a summary of your cooking activity every week
                  </Text>
                </View>
                <Switch
                  value={weeklyReport}
                  onValueChange={setWeeklyReport}
                  trackColor={{ false: '#E5E7EB', true: '#6B46C1' }}
                  thumbColor="white"
                />
              </View>

              <TouchableOpacity style={styles.settingRow}>
                <Text style={styles.settingLabel}>Notification Schedule</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <Text style={styles.settingLabel}>Quiet Hours</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
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
    fontFamily: 'VendSans-Regular',
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'VendSans-SemiBold',
  },
  placeholder: {
    width: 40,
  },
  settingsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'VendSans-Medium',
  },
  settingDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    fontFamily: 'VendSans-Regular',
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
    fontFamily: 'VendSans-Regular',
  },
});
