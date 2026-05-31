import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tehezgpzecdblhebddoo.supabase.co',
  'sb_publishable_8ZGCicXame67Mn1TGcRyng_0jJ3sX-i'
);

type Screen = 'login' | 'register' | 'home';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else {
      setUser(data.user);
      setScreen('home');
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) return;
    if (password.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name } },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Registration Failed', error.message);
    } else {
      setUser(data.user);
      setScreen('home');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setScreen('login');
  };

  if (screen === 'home') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#0F172A' }} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>Welcome to Become</Text>
        <Text style={{ color: '#94A3B8', marginTop: 8, fontSize: 16 }}>Your AI wellness platform is live.</Text>

        <View style={{ backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginTop: 24 }}>
          <Text style={{ color: '#94A3B8', fontSize: 12 }}>Signed in as</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 4 }}>{user?.email}</Text>
        </View>

        <View style={{ backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginTop: 16 }}>
          <Text style={{ color: '#94A3B8', fontSize: 12 }}>READINESS SCORE</Text>
          <Text style={{ color: '#34D399', fontSize: 48, fontWeight: 'bold', marginTop: 8 }}>86</Text>
          <Text style={{ color: '#34D399', fontSize: 14 }}>Recovered</Text>
        </View>

        <View style={{ backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginTop: 16 }}>
          <Text style={{ color: '#94A3B8', fontSize: 12 }}>TODAY'S MEAL PLAN</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 8 }}>Spinach & Feta Omelette</Text>
          <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>Breakfast · 420 cal · P:32g C:18g F:28g</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 12 }}>Grilled Salmon Bowl</Text>
          <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>Lunch · 580 cal · P:42g C:48g F:22g</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 12 }}>Herb Chicken & Quinoa</Text>
          <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>Dinner · 620 cal · P:48g C:52g F:18g</Text>
        </View>

        <View style={{ backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginTop: 16 }}>
          <Text style={{ color: '#94A3B8', fontSize: 12 }}>GENIE AI COACH</Text>
          <Text style={{ color: '#fff', fontSize: 14, marginTop: 8 }}>Ask me anything about your fitness, nutrition, or wellness.</Text>
          <View style={{ backgroundColor: '#334155', borderRadius: 12, padding: 12, marginTop: 12 }}>
            <Text style={{ color: '#6366F1', fontSize: 13 }}>Try: "I'm tired today" or "What should I eat?"</Text>
          </View>
        </View>

        <Pressable
          onPress={handleSignOut}
          style={{ backgroundColor: '#7F1D1D', borderRadius: 12, padding: 16, marginTop: 24, alignItems: 'center' }}
        >
          <Text style={{ color: '#FCA5A5', fontWeight: '600' }}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (screen === 'register') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#6366F1', fontSize: 36, fontWeight: 'bold', textAlign: 'center' }}>Become</Text>
        <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>Start your wellness journey</Text>

        <TextInput placeholder="Full Name" placeholderTextColor="#64748B" value={name} onChangeText={setName}
          style={{ backgroundColor: '#1E293B', borderRadius: 12, padding: 16, color: '#fff', marginTop: 32, borderWidth: 1, borderColor: '#334155' }} />
        <TextInput placeholder="Email" placeholderTextColor="#64748B" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
          style={{ backgroundColor: '#1E293B', borderRadius: 12, padding: 16, color: '#fff', marginTop: 12, borderWidth: 1, borderColor: '#334155' }} />
        <TextInput placeholder="Password (min 8 chars)" placeholderTextColor="#64748B" value={password} onChangeText={setPassword} secureTextEntry
          style={{ backgroundColor: '#1E293B', borderRadius: 12, padding: 16, color: '#fff', marginTop: 12, borderWidth: 1, borderColor: '#334155' }} />

        <Pressable onPress={handleRegister} disabled={loading}
          style={{ backgroundColor: loading ? '#3730A3' : '#6366F1', borderRadius: 12, padding: 16, marginTop: 20, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>{loading ? 'Creating...' : 'Create Account'}</Text>
        </Pressable>

        <Pressable onPress={() => setScreen('login')} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: '#6366F1' }}>Already have an account? Sign In</Text>
        </Pressable>
      </KeyboardAvoidingView>
    );
  }

  // Login screen (default)
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: '#6366F1', fontSize: 36, fontWeight: 'bold', textAlign: 'center' }}>Become</Text>
      <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>Transform your wellness</Text>

      <TextInput placeholder="Email" placeholderTextColor="#64748B" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
        style={{ backgroundColor: '#1E293B', borderRadius: 12, padding: 16, color: '#fff', marginTop: 40, borderWidth: 1, borderColor: '#334155' }} />
      <TextInput placeholder="Password" placeholderTextColor="#64748B" value={password} onChangeText={setPassword} secureTextEntry
        style={{ backgroundColor: '#1E293B', borderRadius: 12, padding: 16, color: '#fff', marginTop: 12, borderWidth: 1, borderColor: '#334155' }} />

      <Pressable onPress={handleLogin} disabled={loading}
        style={{ backgroundColor: loading ? '#3730A3' : '#6366F1', borderRadius: 12, padding: 16, marginTop: 20, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>{loading ? 'Signing In...' : 'Sign In'}</Text>
      </Pressable>

      <Pressable onPress={() => setScreen('register')} style={{ marginTop: 16, alignItems: 'center' }}>
        <Text style={{ color: '#6366F1' }}>Create Account</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
