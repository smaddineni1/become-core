import { Component, type ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props { children: ReactNode; fallback?: ReactNode; onError?: (error: Error, info: React.ErrorInfo) => void; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { this.props.onError?.(error, info); }
  handleRetry = () => { this.setState({ hasError: false, error: null }); };

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <View className="flex-1 bg-slate-950 items-center justify-center px-6">
          <Text className="text-2xl mb-4">⚠️</Text>
          <Text className="text-white text-xl font-bold text-center">Something went wrong</Text>
          <Text className="text-slate-400 text-center mt-2 text-sm">An unexpected error occurred.</Text>
          <Pressable className="bg-indigo-600 rounded-xl py-3 px-8 mt-6 active:bg-indigo-700" onPress={this.handleRetry}>
            <Text className="text-white font-semibold">Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

export function FeatureErrorFallback({ feature, onRetry }: { feature: string; onRetry?: () => void }) {
  return (
    <View className="bg-slate-900 rounded-2xl p-5 border border-slate-800 items-center">
      <Text className="text-slate-400 text-sm">Unable to load {feature}</Text>
      {onRetry && <Pressable className="mt-3 bg-slate-800 rounded-lg px-4 py-2" onPress={onRetry}><Text className="text-indigo-400 text-sm font-medium">Retry</Text></Pressable>}
    </View>
  );
}

export function UnsupportedDeviceFallback() {
  return (
    <View className="flex-1 bg-slate-950 items-center justify-center px-6">
      <Text className="text-2xl mb-4">📱</Text>
      <Text className="text-white text-xl font-bold text-center">Device Not Supported</Text>
      <Text className="text-slate-400 text-center mt-2 text-sm">AI Form Check requires iOS 16+ or Android 12+ with camera support.</Text>
    </View>
  );
}
