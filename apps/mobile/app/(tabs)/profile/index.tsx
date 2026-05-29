import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const handleRetakeQuiz = () => {
    Alert.alert(
      'Retake Wellness Quiz',
      'This will update your fitness goals, activity level, and dietary preferences. Your existing data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retake Quiz',
          onPress: () => router.push('/(onboarding)/quiz'),
        },
      ],
    );
  };

  const handleRetakeScan = () => {
    Alert.alert(
      'Retake Body Scan',
      'This will create a new biometric profile based on your current measurements. Previous scans are kept in your history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start New Scan',
          onPress: () => router.push('/(onboarding)/scan'),
        },
      ],
    );
  };

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
        <SettingsItem
          label="Edit Profile"
          description="Name, email, avatar"
          onPress={() => {}}
        />
        <SettingsItem
          label="Retake Wellness Quiz"
          description="Update goals, activity level, dietary preferences"
          onPress={handleRetakeQuiz}
        />
        <SettingsItem
          label="Retake Body Scan"
          description="Create a new Digital Twin biometric profile"
          onPress={handleRetakeScan}
        />
        <SettingsItem
          label="Subscription"
          description="Manage your All-Access Premium plan"
          onPress={() => {}}
        />
        <SettingsItem
          label="Workout History"
          description="View past form check sessions and scores"
          onPress={() => {}}
        />
        <SettingsItem
          label="Privacy & Data"
          description="Manage your data, export, or delete account"
          onPress={() => {}}
        />

        {/* Sign Out */}
        <Pressable
          className="bg-slate-900 rounded-xl p-4 border border-red-900/30 active:bg-red-950/30 mt-4"
          onPress={() => {
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => router.replace('/(auth)/login'),
              },
            ]);
          }}
        >
          <Text className="text-red-400 font-semibold">Sign Out</Text>
        </Pressable>
      </View>

      {/* App Version */}
      <View className="px-6 py-8 items-center">
        <Text className="text-slate-600 text-xs">Become v0.1.0 · Build 1</Text>
      </View>
    </ScrollView>
  );
}

function SettingsItem({
  label,
  description,
  onPress,
}: {
  label: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="bg-slate-900 rounded-xl p-4 border border-slate-800 active:bg-slate-800"
      onPress={onPress}
    >
      <Text className="text-white font-semibold">{label}</Text>
      <Text className="text-slate-400 text-sm mt-0.5">{description}</Text>
    </Pressable>
  );
}
