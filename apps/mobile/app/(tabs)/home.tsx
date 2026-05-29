import { View, Text, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-6 pt-16 pb-8">
        <Text className="text-3xl font-bold text-white">Welcome back</Text>
        <Text className="text-slate-400 mt-2 text-base">
          Your daily wellness summary
        </Text>
      </View>

      {/* Today's Quick Stats */}
      <View className="px-6 gap-4">
        <View className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <Text className="text-slate-400 text-sm">Today's Score</Text>
          <Text className="text-4xl font-bold text-indigo-400 mt-1">--</Text>
          <Text className="text-slate-500 text-sm mt-1">Complete a session to see your score</Text>
        </View>

        <View className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <Text className="text-slate-400 text-sm">HRV Status</Text>
          <Text className="text-2xl font-semibold text-emerald-400 mt-1">--</Text>
          <Text className="text-slate-500 text-sm mt-1">Log your HRV reading</Text>
        </View>

        <View className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <Text className="text-slate-400 text-sm">Meal Plan</Text>
          <Text className="text-lg font-semibold text-white mt-1">Ready</Text>
          <Text className="text-slate-500 text-sm mt-1">View today's whole-food plan</Text>
        </View>
      </View>
    </ScrollView>
  );
}
