/**
 * Error Boundary Component
 * Catches and handles React component errors
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { handleError, logErrorToMonitoring } from '../utils/errorHandler';
import Text from './Text';
import { colors } from '../utils/colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service
    logErrorToMonitoring(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Handle error with our error handler
    handleError(error, 'ErrorBoundary');
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry for the inconvenience. The app encountered an unexpected error.
            </Text>
            {this.state.error && __DEV__ && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Quicksand-Bold',
    color: colors.charcoal,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.3)',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Quicksand-Regular',
    color: colors.charcoal,
  },
});

export default ErrorBoundary;
