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

export default function SubscriptionScreen() {
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
              <Text style={styles.headerTitle}>Subscription</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Current Plan */}
            <View style={styles.planCard}>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>PREMIUM</Text>
              </View>
              <Text style={styles.planTitle}>Premium Monthly</Text>
              <Text style={styles.planPrice}>$9.99/month</Text>
              <Text style={styles.planDescription}>
                Unlimited recipes, meal planning, and nutrition tracking
              </Text>
            </View>

            {/* Billing Information */}
            <View style={styles.settingsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Billing Information</Text>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Next Billing Date</Text>
                <Text style={styles.settingValue}>Feb 15, 2024</Text>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Payment Method</Text>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>•••• 4242</Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.settingRow}>
                <Text style={styles.settingLabel}>Billing History</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Manage Subscription</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Change Plan</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dangerButton}>
                <Text style={styles.dangerButtonText}>Cancel Subscription</Text>
              </TouchableOpacity>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Your Premium Benefits</Text>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Unlimited recipe generation</Text>
              </View>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Advanced meal planning</Text>
              </View>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Nutrition tracking & insights</Text>
              </View>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Priority support</Text>
              </View>
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
    fontFamily: 'VendSans-Bold',
  },
  planTitle: {
    fontSize: 24,
    color: 'white',
    marginBottom: 8,
    fontFamily: 'VendSans-Bold',
  },
  planPrice: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    fontFamily: 'VendSans-Regular',
  },
  planDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'VendSans-Regular',
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
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 8,
    fontFamily: 'VendSans-Regular',
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
    fontFamily: 'VendSans-Regular',
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
    fontFamily: 'VendSans-SemiBold',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'VendSans-SemiBold',
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
    fontFamily: 'VendSans-SemiBold',
  },
  benefitsContainer: {
    paddingHorizontal: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    fontFamily: 'VendSans-SemiBold',
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 18,
    color: '#6B46C1',
    marginRight: 12,
    backgroundColor: 'white',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'VendSans-Regular',
  },
  benefitText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'VendSans-Regular',
  },
});
