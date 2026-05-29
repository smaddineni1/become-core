import { View, Text, Pressable, ScrollView } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-6 pt-16 pb-8">
        <Text className="text-3xl font-bold text-white">Profile</Text>
      </View>

      {/* Avatar & Name */}
      <View className="px-6 items-center mb-8">
        <View className="w-24 h-24 rounded-full bg-indigo-600 items-center justify-center">
          <Text className="text-white text-3xl font-bold">B</Text>
        </View>
        <Text className="text-white text-xl font-semibold mt-4">User</Text>
        <Text className="text-slate-400 text-sm mt-1">All-Access Premium</Text>
      </View>

      {/* Settings List */}
      <View className="px-6 gap-2">
        {[
          { label: 'Edit Profile', description: 'Name, goals, preferences' },
          { label: 'Retake Body Scan', description: 'Update your Digital Twin measurements' },
          { label: 'Subscription', description: 'Manage your All-Access Premium plan' },
          { label: 'Workout History', description: 'View past form check sessions' },
          { label: 'Privacy & Data', description: 'Manage your data, delete account' },
          { label: 'Sign Out', description: '' },
        ].map((item) => (
          <Pressable
            key={item.label}
            className="bg-slate-900 rounded-xl p-4 border border-slate-800 active:bg-slate-800"
          >
            <Text className="text-white font-semibold">{item.label}</Text>
            {item.description ? (
              <Text className="text-slate-400 text-sm mt-0.5">{item.description}</Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
