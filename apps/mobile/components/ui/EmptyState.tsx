import { View, Text, Pressable } from 'react-native';

interface EmptyStateProps { icon: string; title: string; description: string; actionLabel?: string; onAction?: () => void; }

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center py-12 px-6">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-white font-semibold text-lg text-center">{title}</Text>
      <Text className="text-slate-400 text-sm mt-2 text-center max-w-[280px] leading-5">{description}</Text>
      {actionLabel && onAction && (
        <Pressable className="bg-indigo-600 rounded-xl py-3 px-6 mt-6 active:bg-indigo-700" onPress={onAction}>
          <Text className="text-white font-semibold">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
