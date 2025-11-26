import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RatingModal from '../../components/RatingModal';

export default function SupportScreen() {
  const navigation = useNavigation<any>();
  const [showRatingModal, setShowRatingModal] = useState(false);

  const handleFeedbackPress = (type: 'feedback' | 'bug' | 'feature' | 'support') => {
    navigation.navigate('Feedback', { type });
  };

  const handleRateLoma = () => {
    setShowRatingModal(true);
  };

  const handleRatingSubmit = (rating: number) => {
    // TODO: Implement App Store rating API integration
    console.log('User rated:', rating);

    // Close modal
    setShowRatingModal(false);

    // If rating is 4 or 5 stars, could redirect to App Store
    // For iOS: Linking.openURL('itms-apps://itunes.apple.com/app/idYOUR_APP_ID?action=write-review')
    // For Android: Linking.openURL('market://details?id=YOUR_PACKAGE_NAME')
  };

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
              <TouchableOpacity style={styles.actionCard} onPress={() => handleFeedbackPress('support')}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionTitle}>Contact Support</Text>
                <Text style={styles.actionDescription}>
                  Get help from our team
                </Text>
              </TouchableOpacity>
            </View>

            {/* Settings Sections */}
            <View style={styles.settingsContainer}>
              {/* Feedback Bubble */}
              <View style={styles.categoryBubble}>
                <View style={styles.bubbleHeader}>
                  <Text style={styles.bubbleIcon}>💭</Text>
                  <Text style={styles.bubbleTitle}>Feedback</Text>
                </View>
                <View style={styles.bubbleItems}>
                  <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => handleFeedbackPress('feedback')}
                  >
                    <Text style={styles.settingLabel}>Send Feedback</Text>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => handleFeedbackPress('bug')}
                  >
                    <Text style={styles.settingLabel}>Report a Bug</Text>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => handleFeedbackPress('feature')}
                  >
                    <Text style={styles.settingLabel}>Request a Feature</Text>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.settingRow, styles.settingRowLast]}
                    onPress={handleRateLoma}
                  >
                    <Text style={styles.settingLabel}>Rate Loma</Text>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Danger Zone */}
            <View style={styles.dangerZone}>
              <TouchableOpacity style={styles.dangerButton}>
                <Text style={styles.dangerButtonText}>Delete Account</Text>
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

        {/* Rating Modal */}
        <RatingModal
          visible={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onRate={handleRatingSubmit}
        />
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
    borderColor: '#E5E7EB',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'Quicksand-Bold',
  },
  actionDescription: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Quicksand-Light',
  },
  settingsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  categoryBubble: {
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
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  bubbleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  bubbleTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Quicksand-Bold',
  },
  bubbleItems: {
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  chevron: {
    fontSize: 14,
    color: '#40916C',
  },
  dangerZone: {
    marginHorizontal: 20,
  },
  dangerTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontFamily: 'Quicksand-Bold',
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
    fontFamily: 'Quicksand-Bold',
  },
  infoContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    fontFamily: 'Quicksand-Light',
  },
  infoValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Quicksand-Regular',
  },
});
