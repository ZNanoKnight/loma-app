import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onRate: (rating: number) => void;
}

const { width } = Dimensions.get('window');

export default function RatingModal({ visible, onClose, onRate }: RatingModalProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarPress = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmit = () => {
    if (selectedRating > 0) {
      onRate(selectedRating);
      // Reset for next time
      setSelectedRating(0);
      setHoveredRating(0);
    }
  };

  const handleCancel = () => {
    setSelectedRating(0);
    setHoveredRating(0);
    onClose();
  };

  const renderStar = (index: number) => {
    const isFilled = index <= (hoveredRating || selectedRating);
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleStarPress(index)}
        onPressIn={() => setHoveredRating(index)}
        onPressOut={() => setHoveredRating(0)}
        style={styles.starButton}
        activeOpacity={0.7}
      >
        <Text style={[styles.star, isFilled && styles.starFilled]}>
          {isFilled ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* App Icon Placeholder */}
          <View style={styles.iconContainer}>
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>L</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Enjoying Loma?</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Tap a star to rate it on the App Store
          </Text>

          {/* Star Rating */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(renderStar)}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={selectedRating === 0}
            >
              <Text
                style={[
                  styles.buttonText,
                  styles.rateButtonText,
                  selectedRating === 0 && styles.buttonTextDisabled,
                ]}
              >
                Rate
              </Text>
            </TouchableOpacity>

            <View style={styles.buttonSeparator} />

            <TouchableOpacity style={styles.button} onPress={handleCancel}>
              <Text style={styles.buttonText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width - 80,
    maxWidth: 320,
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  appIcon: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  appIconText: {
    fontSize: 36,
    color: 'white',
    fontFamily: 'Quicksand-Bold',
  },
  title: {
    fontSize: 17,
    fontFamily: 'Quicksand-SemiBold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Quicksand-Regular',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
    marginBottom: 20,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 40,
    color: '#C7C7CC',
  },
  starFilled: {
    color: '#FFD700',
  },
  buttonsContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C6C6C8',
  },
  button: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
  },
  buttonText: {
    fontSize: 17,
    fontFamily: 'Quicksand-Regular',
    color: '#007AFF',
  },
  rateButtonText: {
    fontFamily: 'Quicksand-SemiBold',
  },
  buttonTextDisabled: {
    color: '#C7C7CC',
  },
});
