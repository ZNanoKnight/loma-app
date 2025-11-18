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
import { useUser } from '../../context/UserContext';

export default function DietaryPreferencesScreen() {
  const navigation = useNavigation<any>();
  const { userData } = useUser();

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
              <Text style={styles.headerTitle}>Dietary Preferences</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Settings Content */}
            <View style={styles.settingsContainer}>
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Dietary Preferences</Text>
                  <Text style={styles.settingDescription}>
                    {userData.dietaryPreferences?.join(', ') || 'None selected'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Allergens</Text>
                  <Text style={styles.settingDescription}>
                    {userData.allergens?.join(', ') || 'None selected'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Macro Targets</Text>
                  <Text style={styles.settingDescription}>
                    Set your daily protein, carbs, and fat targets
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Calorie Goals</Text>
                  <Text style={styles.settingDescription}>
                    Not set
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Disliked Ingredients</Text>
                  <Text style={styles.settingDescription}>
                    Ingredients you'd prefer to avoid in recipes
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Cuisine Preferences</Text>
                  <Text style={styles.settingDescription}>
                    Your favorite types of cuisine
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow} >
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Default Serving Size</Text>
                  <Text style={styles.settingDescription}>
                    2
                  </Text>
                </View>
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
