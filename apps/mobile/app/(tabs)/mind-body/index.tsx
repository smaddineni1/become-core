import { View, Text, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';

type Tab = 'yoga' | 'meditation';

export default function MindBodyScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('meditation');

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-6 pt-16 pb-4">
        <Text className="text-3xl font-bold text-white">Mind & Body</Text>
      </View>

      {/* Tab Toggle */}
      <View className="px-6 mb-6">
        <View className="flex-row bg-slate-900 rounded-xl p-1 border border-slate-800">
          <Pressable
            className={`flex-1 py-3 rounded-lg ${activeTab === 'yoga' ? 'bg-indigo-600' : ''}`}
            onPress={() => setActiveTab('yoga')}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === 'yoga' ? 'text-white' : 'text-slate-400'
              }`}
            >
              Yoga
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-3 rounded-lg ${activeTab === 'meditation' ? 'bg-indigo-600' : ''}`}
            onPress={() => setActiveTab('meditation')}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === 'meditation' ? 'text-white' : 'text-slate-400'
              }`}
            >
              Meditation
            </Text>
          </Pressable>
        </View>
      </View>

      {/* HRV Recommendation Strip */}
      <View className="px-6 mb-6">
        <View className="bg-gradient-to-r from-emerald-900/50 to-indigo-900/50 rounded-2xl p-5 border border-emerald-800/30">
          <Text className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Recommended For You
          </Text>
          <Text className="text-white text-lg font-semibold mt-2">
            Based on your HRV
          </Text>
          <Text className="text-slate-400 text-sm mt-1">
            Log your HRV to receive personalized recommendations
          </Text>
        </View>
      </View>

      {/* Session Grid */}
      <View className="px-6 gap-4">
        <Text className="text-white text-lg font-semibold">
          {activeTab === 'yoga' ? 'Yoga Sessions' : 'Meditation Sessions'}
        </Text>
        <View className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <Text className="text-slate-400 text-center">
            Sessions will appear here
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
