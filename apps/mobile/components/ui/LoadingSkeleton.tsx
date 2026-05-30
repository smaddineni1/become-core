import { View, type ViewStyle } from 'react-native';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function LoadingSkeleton({ width = '100%', height = 20, borderRadius = 8, style }: LoadingSkeletonProps) {
  return (
    <View className="bg-slate-800 overflow-hidden animate-pulse" style={[{ width, height, borderRadius }, style]}>
      <View className="absolute inset-0 bg-slate-700/50" />
    </View>
  );
}

export function MealPlanSkeleton() {
  return (
    <View className="px-6 gap-4">
      <View className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <LoadingSkeleton width="60%" height={16} />
        <LoadingSkeleton width="40%" height={28} style={{ marginTop: 8 }} />
      </View>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <LoadingSkeleton width="30%" height={12} />
          <LoadingSkeleton width="80%" height={18} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
}

export function DashboardSkeleton() {
  return (
    <View className="px-6 gap-4">
      <LoadingSkeleton width="60%" height={28} />
      <View className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mt-4">
        <LoadingSkeleton width="40%" height={14} />
        <LoadingSkeleton width={80} height={48} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View className="px-6 items-center gap-4">
      <LoadingSkeleton width={96} height={96} borderRadius={48} />
      <LoadingSkeleton width={120} height={20} />
      {[1, 2, 3, 4].map((i) => (
        <LoadingSkeleton key={i} height={56} borderRadius={12} style={{ width: '100%' }} />
      ))}
    </View>
  );
}
