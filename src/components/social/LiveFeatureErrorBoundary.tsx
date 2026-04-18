import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { devWarn } from '../../utils/devLog';

interface LiveFeatureErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  body?: string;
}

interface LiveFeatureErrorBoundaryState {
  hasError: boolean;
}

export class LiveFeatureErrorBoundary extends Component<
  LiveFeatureErrorBoundaryProps,
  LiveFeatureErrorBoundaryState
> {
  override state: LiveFeatureErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    devWarn('[OrbitX][LiveFeatureErrorBoundary]', error.message, errorInfo.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>{this.props.title ?? 'No pudimos cargar esta parte del directo'}</Text>
        <Text style={styles.body}>
          {this.props.body ?? 'Vuelve a intentarlo. Tu sesion y tu saldo siguen seguros.'}
        </Text>
        <Pressable style={styles.button} onPress={this.handleRetry}>
          <Text style={styles.buttonLabel}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(123,63,228,0.18)',
    backgroundColor: 'rgba(11,11,15,0.92)',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  body: {
    color: 'rgba(255,255,255,0.68)',
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 4,
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: 'rgba(123,63,228,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(123,63,228,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
});
