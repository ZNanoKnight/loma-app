import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function SupportScreen() {
  const navigation = useNavigation<any>();

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
              <Text style={styles.headerTitle}>Help & Support</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>📚</Text>
                <Text style={styles.actionTitle}>Help Center</Text>
                <Text style={styles.actionDescription}>
                  Browse articles and guides
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionTitle}>Contact Support</Text>
                <Text style={styles.actionDescription}>
                  Get help from our team
                </Text>
              </TouchableOpacity>
            </View>

            {/* Resources */}
            <View style={styles.settingsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Resources</Text>
              </View>

              <TouchableOpacity style={styles.settingRow}>
                <Text style={styles.settingLabel}>Getting Started Guide</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <Text style={styles.settingLabel}>FAQs</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Legal */}
            <View style={styles.settingsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Legal</Text>
              </View>

              <TouchableOpacity style={styles.settingRow}>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <Text style={styles.settingLabel}>Terms of Service</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <Text style={styles.settingLabel}>Licenses</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Feedback */}
            <View style={styles.settingsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Feedback</Text>
              </View>

              <TouchableOpacity style={styles.settingRow}>
                <Text style={styles.settingLabel}>Send Feedback</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <Text style={styles.settingLabel}>Report a Bug</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <Text style={styles.settingLabel}>Request a Feature</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <Text style={styles.settingLabel}>Rate Loma</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* App Information */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
              <Text style={styles.infoLabel}>Build Number</Text>
              <Text style={styles.infoValue}>2024.01.15</Text>
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
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
    fontFamily: 'VendSans-Regular',
  },
  actionTitle: {
    fontSize: 14,
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'VendSans-SemiBold',
  },
  actionDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontFamily: 'VendSans-Regular',
  },
  settingsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'VendSans-SemiBold',
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
    fontFamily: 'VendSans-Medium',
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
    fontFamily: 'VendSans-Regular',
  },
  infoContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    fontFamily: 'VendSans-Regular',
  },
  infoValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontFamily: 'VendSans-Medium',
  },
});
