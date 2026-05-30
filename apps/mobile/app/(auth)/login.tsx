import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-950"
    >
      <View className="flex-1 px-6 justify-center">
        {/* Logo */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-white">Become</Text>
          <Text className="text-slate-400 mt-2">Transform your wellness</Text>
        </View>

        {/* Form */}
        <View className="gap-4">
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
            placeholder="Password"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            className={`rounded-xl py-4 mt-4 ${loading ? 'bg-indigo-800' : 'bg-indigo-600 active:bg-indigo-700'}`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </Pressable>

          {/* Social Auth */}
          <View className="gap-3 mt-6">
            <Pressable className="bg-white rounded-xl py-4 active:bg-gray-100">
              <Text className="text-slate-900 text-center font-semibold">
                Continue with Apple
              </Text>
            </Pressable>
            <Pressable className="bg-slate-800 rounded-xl py-4 border border-slate-700 active:bg-slate-700">
              <Text className="text-white text-center font-semibold">
                Continue with Google
              </Text>
            </Pressable>
          </View>

          {/* Links */}
          <View className="flex-row justify-between mt-6">
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text className="text-indigo-400 font-medium">Create Account</Text>
            </Pressable>
            <Pressable>
              <Text className="text-slate-400">Forgot Password?</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
