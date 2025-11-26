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
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';

export default function AppPreferencesScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();

  const [metricUnits, setMetricUnits] = useState(userData.metricUnits);

  // Update global state when settings change
  useEffect(() => {
    updateUserData({
      metricUnits,
    });
  }, [metricUnits]);

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
              <Text style={styles.headerTitle}>App Preferences</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Settings Content */}
            <View style={styles.settingsContainer}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Metric Units</Text>
                  <Text style={styles.settingDescription}>
                    Use metric system (kg, cm) instead of imperial (lbs, in)
                  </Text>
                </View>
                <Switch
                  value={metricUnits}
                  onValueChange={setMetricUnits}
                  trackColor={{ false: '#E5E7EB', true: '#40916C' }}
                  thumbColor="white"
                />
              </View>

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Language</Text>
                  <Text style={styles.settingDescription}>
                    Choose your preferred language
                  </Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>English</Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Default Serving Size</Text>
                  <Text style={styles.settingDescription}>
                    Default number of servings for new recipes
                  </Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>2</Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Recipe Difficulty</Text>
                  <Text style={styles.settingDescription}>
                    Preferred difficulty level for recipe suggestions
                  </Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>Medium</Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
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
  },
  headerTitle: {
    fontSize: 18,
    color: '#1B4332',
    fontFamily: 'Quicksand-Bold',
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
    fontFamily: 'Quicksand-Bold',
  },
  settingDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    fontFamily: 'Quicksand-Light',
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
  },
});
