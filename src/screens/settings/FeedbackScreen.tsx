import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

type FeedbackType = 'feedback' | 'bug' | 'feature' | 'support';

export default function FeedbackScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const feedbackType: FeedbackType = route.params?.type || 'feedback';

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const getTitle = () => {
    switch (feedbackType) {
      case 'bug':
        return 'Report a Bug';
      case 'feature':
        return 'Request a Feature';
      case 'support':
        return 'Contact Support';
      default:
        return 'Send Feedback';
    }
  };

  const getPlaceholder = () => {
    switch (feedbackType) {
      case 'bug':
        return 'Please describe the bug you encountered, including steps to reproduce it...';
      case 'feature':
        return 'Please describe the feature you would like to see in Loma...';
      case 'support':
        return 'Please describe the issue you need help with...';
      default:
        return 'Share your thoughts about Loma...';
    }
  };

  const handleSubmit = () => {
    // TODO: Implement API call to submit feedback
    console.log('Submitting feedback:', {
      type: feedbackType,
      subject,
      message,
      email,
    });

    // Show success message and navigate back
    navigation.goBack();
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid =
    subject.trim().length > 0 &&
    message.trim().length > 0 &&
    email.trim().length > 0 &&
    isValidEmail(email);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>
              {feedbackType === 'bug' ? '🐛' : feedbackType === 'feature' ? '✨' : feedbackType === 'support' ? '🗣' : '💬'}
            </Text>
            <Text style={styles.infoText}>
              {feedbackType === 'bug'
                ? 'Help us improve by reporting any issues you encounter.'
                : feedbackType === 'feature'
                ? 'We love hearing your ideas for new features!'
                : feedbackType === 'support'
                ? 'Let us know how we can assist you.'
                : 'Your feedback helps us make Loma better for everyone.'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.inputHint}>
                We'll only use this to follow up on your {feedbackType === 'bug' ? 'bug report' : feedbackType === 'feature' ? 'feature request' : feedbackType === 'support' ? 'issue' : 'feedback'}
              </Text>
            </View>

            {/* Subject Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <TextInput
                style={styles.input}
                placeholder={
                  feedbackType === 'bug'
                    ? 'Brief description of the bug'
                    : feedbackType === 'feature'
                    ? 'Feature name or summary'
                    : feedbackType === 'support'
                    ? 'Brief description of your issue'
                    : 'What is this about?'
                }
                placeholderTextColor="#9CA3AF"
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            {/* Message Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Details *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={getPlaceholder()}
                placeholderTextColor="#9CA3AF"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    paddingBottom: 20,
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
  infoCard: {
    marginHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Quicksand-Regular',
    lineHeight: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Quicksand-SemiBold',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Quicksand-Regular',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  inputHint: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Quicksand-Regular',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Quicksand-SemiBold',
  },
});
