import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    // Supabase auth integration — Phase 1.3
    router.replace('/(onboarding)/quiz');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-950"
    >
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-white">Join Become</Text>
          <Text className="text-slate-400 mt-2">Start your wellness journey</Text>
        </View>

        <View className="gap-4">
          <TextInput
            className="bg-slate-900 rounded-xl px-4 py-4 text-white border border-slate-800"
            placeholder="Full Name"
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            className="bg-slate-900 rounded-xl px-4 py-4 text-white border border-slate-800"
            placeholder="Email"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="bg-slate-900 rounded-xl px-4 py-4 text-white border border-slate-800"
            placeholder="Password (min 8 characters)"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            className="bg-indigo-600 rounded-xl py-4 mt-4 active:bg-indigo-700"
            onPress={handleRegister}
          >
            <Text className="text-white text-center font-semibold text-lg">Create Account</Text>
          </Pressable>

          <Text className="text-slate-500 text-xs text-center mt-4 leading-5">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
            Your data is encrypted and processed in accordance with US regulations.
          </Text>

          <Pressable className="mt-4" onPress={() => router.back()}>
            <Text className="text-indigo-400 text-center font-medium">
              Already have an account? Sign In
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
