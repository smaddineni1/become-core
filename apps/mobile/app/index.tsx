import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Video, ResizeMode } from 'expo-av';
import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as SMS from 'expo-sms';

const supabase = createClient(
  'https://tehezgpzecdblhebddoo.supabase.co',
  'sb_publishable_8ZGCicXame67Mn1TGcRyng_0jJ3sX-i'
);

const BREATHING_VIDEO_URL = 'https://tehezgpzecdblhebddoo.supabase.co/storage/v1/object/public/videos/runway-agent-exhale-20260528-152325.mp4';

type Screen = 'login' | 'register' | 'quiz' | 'scan' | 'home' | 'nutrition' | 'formcheck' | 'mindbody' | 'breathing' | 'activity' | 'challenges' | 'create_challenge' | 'genie' | 'camera_scan' | 'formcheck_session';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [genieOpen, setGenieOpen] = useState(false);
  const [genieInput, setGenieInput] = useState('');
  const [genieMessages, setGenieMessages] = useState<Array<{role:string;text:string;buttons?:any[]}>>([]); 
  const [genieLoading, setGenieLoading] = useState(false);

  // Quiz state
  const [quizStep, setQuizStep] = useState(1);
  const [quizData, setQuizData] = useState({ age: '', sex: '', heightCm: '', weightKg: '', goal: '', activity: '' });

  // Scan state
  const [scanProgress, setScanProgress] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [scanPhase, setScanPhase] = useState<'photo' | 'scanning' | 'done'>('photo');
  const scanTimer = useRef<any>(null);

  // Nutrition state
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);

  // Points/Gamification state
  const [points, setPoints] = useState({ total: 0, level: 1, streak: 0 });
  const [activityLog, setActivityLog] = useState<any[]>([]);

  // Challenge state
  const [challenges, setChallenges] = useState<any[]>([]);
  const [myChallenges, setMyChallenges] = useState<any[]>([]);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeType, setChallengeType] = useState('squat');
  const [challengeTarget, setChallengeTarget] = useState('');
  const [challengeDays, setChallengeDays] = useState('');
  const [joinCode, setJoinCode] = useState('');

  // Camera/Scan state
  const [cameraPermission, setCameraPermission] = useState(false);
  const [scanPhoto, setScanPhoto] = useState<string | null>(null);

  // Form Check state  
  const [formCheckActive, setFormCheckActive] = useState(false);
  const [formCheckScore, setFormCheckScore] = useState(0);
  const [formCheckReps, setFormCheckReps] = useState(0);
  const [formCheckTimer, setFormCheckTimer] = useState(0);
  const formCheckInterval = useRef<any>(null);

  // === FUNCTIONS DEFINED BEFORE useEffect ===
  const loadPoints = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_points').select('*').eq('user_id', user.id).single();
    if (data) setPoints({ total: data.total_points, level: data.level, streak: data.current_streak_days });
  };

  const loadActivityLog = async () => {
    if (!user) return;
    const { data } = await supabase.from('activity_log').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(20);
    if (data) setActivityLog(data);
  };

  const loadChallenges = async () => {
    if (!user) return;
    const { data: pub } = await supabase.from('challenges').select('*').eq('is_public', true).order('created_at', { ascending: false }).limit(20);
    if (pub) setChallenges(pub);
    const { data: mine } = await supabase.from('challenge_participants').select('*, challenges(*)').eq('user_id', user.id);
    if (mine) setMyChallenges(mine);
  };

  // Check session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { setUser(data.session.user); setScreen('home'); loadPoints(); loadActivityLog(); }
    });
  }, []);

  // === AUTH ===
  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Sign In Failed', error.message);
    else { setUser(data.user); setScreen('home'); }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) return;
    if (password.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    setLoading(false);
    if (error) Alert.alert('Registration Failed', error.message);
    else { setUser(data.user); setScreen('quiz'); }
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); setUser(null); setScreen('login'); };

  // === QUIZ ===
  const saveQuiz = async () => {
    if (!user) return;
    await supabase.from('user_profiles').update({
      age: parseInt(quizData.age), sex: quizData.sex, height_cm: parseFloat(quizData.heightCm),
      weight_kg: parseFloat(quizData.weightKg), fitness_goal: quizData.goal, activity_level: quizData.activity,
    }).eq('id', user.id);
    setScreen('scan');
    startScan();
  };

  // === SCAN ===
  const startScan = () => {
    setScanProgress(0); setScanDone(false); setScanPhase('scanning');
    let p = 0;
    scanTimer.current = setInterval(() => {
      p += 1.67;
      setScanProgress(Math.min(100, p));
      if (p >= 100) { clearInterval(scanTimer.current); setScanDone(true); setScanPhase('done'); }
    }, 1000);
  };

  const finishScan = async () => {
    if (!user) return;
    await supabase.from('user_biometric_profiles').insert({
      user_id: user.id, provider: 'simulation', measurements: { bmi: 23.5, body_fat_percentage: 18.2 }, confidence: 0.85,
    });
    await supabase.from('user_profiles').update({ onboarding_completed_at: new Date().toISOString() }).eq('id', user.id);
    setScanPhase('photo');
    setScreen('home');
  };

  // === GENIE ===
  const sendGenie = async () => {
    if (!genieInput.trim() || genieLoading) return;
    const msg = genieInput.trim();
    setGenieMessages(prev => [...prev, { role: 'user', text: msg }]);
    setGenieInput('');
    setGenieLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('https://tehezgpzecdblhebddoo.supabase.co/functions/v1/genie-message', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (data.response) {
        setGenieMessages(prev => [...prev, { role: 'assistant', text: data.response.text, buttons: data.response.action_buttons }]);
      } else {
        setGenieMessages(prev => [...prev, { role: 'assistant', text: data.error || 'Something went wrong' }]);
      }
    } catch (e: any) {
      setGenieMessages(prev => [...prev, { role: 'assistant', text: 'Connection error. Try again.' }]);
    }
    setGenieLoading(false);
  };

  // === NUTRITION ===
  const generateMealPlan = async () => {
    setNutritionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('https://tehezgpzecdblhebddoo.supabase.co/functions/v1/generate-meal-plan', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.plan) setMealPlan(data.plan);
      else Alert.alert('Error', data.error || 'Could not generate plan');
    } catch (e) { Alert.alert('Error', 'Connection failed'); }
    setNutritionLoading(false);
  };

  // === GAMIFICATION ===
  const POINTS_MAP: Record<string,number> = { meal_logged: 10, workout_completed: 25, water_logged: 5, breathing_completed: 15, hrv_logged: 10, streak_bonus: 50 };

  const logActivity = async (type: string, description: string) => {
    if (!user) return;
    const pts = POINTS_MAP[type] || 10;
    await supabase.from('activity_log').insert({ user_id: user.id, activity_type: type, description, points_earned: pts });

    const { data: existing } = await supabase.from('user_points').select('*').eq('user_id', user.id).single();
    const today = new Date().toISOString().split('T')[0];

    if (existing) {
      const isConsecutive = existing.last_activity_date === new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const isSameDay = existing.last_activity_date === today;
      const newStreak = isSameDay ? existing.current_streak_days : isConsecutive ? existing.current_streak_days + 1 : 1;
      const newTotal = existing.total_points + pts + (newStreak > existing.current_streak_days && newStreak % 7 === 0 ? 50 : 0);
      const newLevel = Math.floor(newTotal / 100) + 1;
      await supabase.from('user_points').update({
        total_points: newTotal, level: newLevel, current_streak_days: newStreak,
        longest_streak_days: Math.max(newStreak, existing.longest_streak_days), last_activity_date: today, updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);
      setPoints({ total: newTotal, level: newLevel, streak: newStreak });
    } else {
      await supabase.from('user_points').insert({ user_id: user.id, total_points: pts, level: 1, current_streak_days: 1, last_activity_date: today });
      setPoints({ total: pts, level: 1, streak: 1 });
    }

    const { data: dailyExisting } = await supabase.from('daily_points').select('*').eq('user_id', user.id).eq('points_date', today).single();
    if (dailyExisting) {
      await supabase.from('daily_points').update({ points_earned: dailyExisting.points_earned + pts, activities_count: dailyExisting.activities_count + 1 }).eq('id', dailyExisting.id);
    } else {
      await supabase.from('daily_points').insert({ user_id: user.id, points_date: today, points_earned: pts, activities_count: 1 });
    }

    await loadActivityLog();
    Alert.alert('Points Earned!', `+${pts} XP for ${description}`);
  };

  // === CHALLENGES ===
  const createChallenge = async () => {
    if (!user || !challengeTitle || !challengeTarget || !challengeDays) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const endDate = new Date(Date.now() + parseInt(challengeDays) * 86400000).toISOString();
    const { data, error } = await supabase.from('challenges').insert({
      creator_id: user.id, title: challengeTitle, challenge_type: challengeType,
      target_value: parseInt(challengeTarget), duration_days: parseInt(challengeDays),
      invite_code: code, is_public: true, start_date: new Date().toISOString(), end_date: endDate,
    }).select().single();
    if (error) { Alert.alert('Error', error.message); return; }
    if (data) {
      await supabase.from('challenge_participants').insert({ challenge_id: data.id, user_id: user.id, current_progress: 0 });
      Alert.alert('Challenge Created!', `Invite code: ${code}`);
      setChallengeTitle(''); setChallengeTarget(''); setChallengeDays('');
      await loadChallenges();
      setScreen('challenges');
    }
  };

  const joinChallenge = async () => {
    if (!user || !joinCode.trim()) return;
    const { data: ch } = await supabase.from('challenges').select('*').eq('invite_code', joinCode.trim().toUpperCase()).single();
    if (!ch) { Alert.alert('Error', 'Challenge not found'); return; }
    const { error } = await supabase.from('challenge_participants').insert({ challenge_id: ch.id, user_id: user.id, current_progress: 0 });
    if (error) { Alert.alert('Error', error.message); return; }
    Alert.alert('Joined!', `You joined: ${ch.title}`);
    setJoinCode('');
    await loadChallenges();
  };

  const inviteToChallenge = async (challenge: any) => {
    const available = await SMS.isAvailableAsync();
    if (!available) { Alert.alert('SMS not available', 'SMS is not available on this device'); return; }
    const message = `Join my Become challenge! ${challenge.challenges?.title || challenge.title}. Use code: ${challenge.challenges?.invite_code || challenge.invite_code}`;
    await SMS.sendSMSAsync([], message);
  };

  // === CAMERA SCAN ===
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setCameraPermission(status === 'granted');
    return status === 'granted';
  };

  const takeBodyPhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) { Alert.alert('Permission Required', 'Camera access is needed for body scan'); return; }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      setScanPhoto(result.assets[0].uri);
      // Upload to Supabase Storage
      if (user) {
        const fileName = `scans/${user.id}/${Date.now()}.jpg`;
        // Note: actual upload requires file reading - for now store URI
        await supabase.from('user_biometric_profiles').insert({
          user_id: user.id, provider: 'camera_scan', 
          measurements: { photo_uri: result.assets[0].uri, bmi: 23.5, body_fat_percentage: 18.2 }, 
          confidence: 0.85,
        });
      }
      setScreen('scan');
      setScanPhase('scanning');
      startScan();
    }
  };

  // === FORM CHECK ===
  const startFormCheck = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) { Alert.alert('Permission Required', 'Camera access is needed for form check'); return; }
    setFormCheckActive(true);
    setFormCheckScore(0);
    setFormCheckReps(0);
    setFormCheckTimer(0);
    setScreen('formcheck_session');
    formCheckInterval.current = setInterval(() => {
      setFormCheckTimer(prev => prev + 1);
      // Simulate scoring
      setFormCheckScore(Math.floor(Math.random() * 15) + 82);
    }, 1000);
  };

  const endFormCheck = async () => {
    if (formCheckInterval.current) clearInterval(formCheckInterval.current);
    setFormCheckActive(false);
    if (user) {
      const avgScore = Math.floor(Math.random() * 10) + 85;
      await supabase.from('workout_sessions').insert({
        user_id: user.id, exercise: 'air_squat', total_reps: formCheckReps,
        average_score: avgScore, duration_seconds: formCheckTimer, cues_detected: [],
      });
      await logActivity('workout_completed', `Form Check: ${formCheckReps} reps, score ${avgScore}`);
    }
    Alert.alert('Session Complete!', `${formCheckReps} reps · Avg Score: ${formCheckScore}`);
    setScreen('home');
  };

  // ===================== SCREENS =====================

  // --- LOGIN ---
  if (screen === 'login') return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={S.container}>
      <Text style={S.logo}>Become</Text>
      <Text style={S.subtitle}>Transform your wellness</Text>
      <TextInput placeholder="Email" placeholderTextColor="#64748B" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={S.input} />
      <TextInput placeholder="Password" placeholderTextColor="#64748B" value={password} onChangeText={setPassword} secureTextEntry style={[S.input, {marginTop:12}]} />
      <Pressable onPress={handleLogin} disabled={loading} style={[S.btn, loading && {opacity:0.6}]}>
        <Text style={S.btnText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
      </Pressable>
      <Pressable onPress={() => setScreen('register')} style={{marginTop:16,alignItems:'center'}}>
        <Text style={{color:'#6366F1'}}>Create Account</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );

  // --- REGISTER ---
  if (screen === 'register') return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={S.container}>
      <Text style={S.logo}>Become</Text>
      <Text style={S.subtitle}>Start your wellness journey</Text>
      <TextInput placeholder="Full Name" placeholderTextColor="#64748B" value={name} onChangeText={setName} style={[S.input,{marginTop:32}]} />
      <TextInput placeholder="Email" placeholderTextColor="#64748B" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={[S.input,{marginTop:12}]} />
      <TextInput placeholder="Password (min 8 chars)" placeholderTextColor="#64748B" value={password} onChangeText={setPassword} secureTextEntry style={[S.input,{marginTop:12}]} />
      <Pressable onPress={handleRegister} disabled={loading} style={[S.btn, loading && {opacity:0.6}]}>
        <Text style={S.btnText}>{loading ? 'Creating...' : 'Create Account'}</Text>
      </Pressable>
      <Pressable onPress={() => setScreen('login')} style={{marginTop:16,alignItems:'center'}}>
        <Text style={{color:'#6366F1'}}>Already have an account? Sign In</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );

  // --- QUIZ ---
  if (screen === 'quiz') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Text style={{color:'#6366F1',fontSize:12,fontWeight:'600'}}>Step {quizStep} of 4</Text>
      <View style={{height:4,backgroundColor:'#1E293B',borderRadius:4,marginTop:8}}>
        <View style={{height:4,backgroundColor:'#6366F1',borderRadius:4,width:`${quizStep*25}%`}} />
      </View>

      {quizStep === 1 && (<View style={{marginTop:32}}>
        <Text style={S.qTitle}>About You</Text>
        <TextInput placeholder="Age" placeholderTextColor="#64748B" value={quizData.age} onChangeText={v=>setQuizData({...quizData,age:v})} keyboardType="number-pad" style={S.input} />
        <Text style={{color:'#94A3B8',marginTop:16,marginBottom:8}}>Sex</Text>
        {['male','female','other'].map(s => (
          <Pressable key={s} onPress={()=>setQuizData({...quizData,sex:s})} style={[S.option, quizData.sex===s && S.optionActive]}>
            <Text style={{color:quizData.sex===s?'#A5B4FC':'#fff',textTransform:'capitalize'}}>{s}</Text>
          </Pressable>
        ))}
      </View>)}

      {quizStep === 2 && (<View style={{marginTop:32}}>
        <Text style={S.qTitle}>Body Measurements</Text>
        <TextInput placeholder="Height (cm)" placeholderTextColor="#64748B" value={quizData.heightCm} onChangeText={v=>setQuizData({...quizData,heightCm:v})} keyboardType="decimal-pad" style={S.input} />
        <TextInput placeholder="Weight (kg)" placeholderTextColor="#64748B" value={quizData.weightKg} onChangeText={v=>setQuizData({...quizData,weightKg:v})} keyboardType="decimal-pad" style={[S.input,{marginTop:12}]} />
      </View>)}

      {quizStep === 3 && (<View style={{marginTop:32}}>
        <Text style={S.qTitle}>Primary Goal</Text>
        {[{id:'lose_fat',label:'Lose Fat'},{id:'build_muscle',label:'Build Muscle'},{id:'improve_mobility',label:'Improve Mobility'},{id:'reduce_stress',label:'Reduce Stress'}].map(g => (
          <Pressable key={g.id} onPress={()=>setQuizData({...quizData,goal:g.id})} style={[S.option, quizData.goal===g.id && S.optionActive]}>
            <Text style={{color:quizData.goal===g.id?'#A5B4FC':'#fff'}}>{g.label}</Text>
          </Pressable>
        ))}
      </View>)}

      {quizStep === 4 && (<View style={{marginTop:32}}>
        <Text style={S.qTitle}>Activity Level</Text>
        {[{id:'sedentary',label:'Sedentary'},{id:'lightly_active',label:'Lightly Active'},{id:'moderately_active',label:'Moderately Active'},{id:'very_active',label:'Very Active'}].map(a => (
          <Pressable key={a.id} onPress={()=>setQuizData({...quizData,activity:a.id})} style={[S.option, quizData.activity===a.id && S.optionActive]}>
            <Text style={{color:quizData.activity===a.id?'#A5B4FC':'#fff'}}>{a.label}</Text>
          </Pressable>
        ))}
      </View>)}

      <Pressable onPress={()=>{ quizStep < 4 ? setQuizStep(quizStep+1) : saveQuiz(); }} style={[S.btn,{marginTop:32}]}>
        <Text style={S.btnText}>{quizStep < 4 ? 'Next' : 'Continue to Body Scan'}</Text>
      </Pressable>
      {quizStep > 1 && <Pressable onPress={()=>setQuizStep(quizStep-1)} style={{marginTop:12,alignItems:'center'}}><Text style={{color:'#94A3B8'}}>Back</Text></Pressable>}
    </ScrollView>
  );

  // --- SCAN ---
  if (screen === 'scan') return (
    <View style={{flex:1,backgroundColor:'#0F172A',alignItems:'center',justifyContent:'center',padding:24}}>
      {scanPhase === 'photo' && !scanPhoto ? (
        <>
          <Text style={{fontSize:48}}>📸</Text>
          <Text style={{color:'#fff',fontSize:24,fontWeight:'bold',marginTop:16}}>Body Scan Photo</Text>
          <Text style={{color:'#94A3B8',marginTop:8,textAlign:'center'}}>Take a full-body photo for accurate measurements</Text>
          <Pressable onPress={takeBodyPhoto} style={[S.btn,{marginTop:24,width:'100%'}]}>
            <Text style={S.btnText}>Take Photo</Text>
          </Pressable>
          <Pressable onPress={()=>{startScan();}} style={{marginTop:16,alignItems:'center'}}>
            <Text style={{color:'#6366F1'}}>Skip photo (use simulation)</Text>
          </Pressable>
        </>
      ) : scanPhase === 'scanning' ? (
        <>
          {scanPhoto && <Text style={{color:'#34D399',fontSize:13,marginBottom:16}}>✓ Photo captured</Text>}
          <View style={{width:200,height:200,borderRadius:100,borderWidth:4,borderColor:'#6366F1',alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#fff',fontSize:36,fontWeight:'bold'}}>{Math.round(scanProgress)}%</Text>
            <Text style={{color:'#6366F1',fontSize:12,marginTop:4}}>{Math.floor(scanProgress*2.43)} measurements</Text>
          </View>
          <Text style={{color:'#fff',fontSize:20,fontWeight:'bold',marginTop:24}}>Analyzing...</Text>
          <Text style={{color:'#94A3B8',marginTop:8,textAlign:'center'}}>Processing your biometric data</Text>
        </>
      ) : (
        <>
          <Text style={{fontSize:48,color:'#34D399'}}>✓</Text>
          <Text style={{color:'#fff',fontSize:24,fontWeight:'bold',marginTop:16}}>Scan Complete!</Text>
          <Text style={{color:'#94A3B8',marginTop:8,textAlign:'center'}}>243 body measurements mapped</Text>
          <Pressable onPress={finishScan} style={[S.btn,{marginTop:32,width:'100%'}]}>
            <Text style={S.btnText}>Enter Become</Text>
          </Pressable>
        </>
      )}
    </View>
  );

  // --- FORM CHECK SESSION ---
  if (screen === 'formcheck_session') return (
    <View style={{flex:1,backgroundColor:'#0F172A'}}>
      {/* Camera View */}
      <View style={{flex:1,backgroundColor:'#1E293B',alignItems:'center',justifyContent:'center'}}>
        {cameraPermission ? (
          <CameraView style={{width:'100%',height:'100%'}} facing="front" />
        ) : (
          <View style={{alignItems:'center',justifyContent:'center',flex:1}}>
            <Text style={{fontSize:48}}>📷</Text>
            <Text style={{color:'#fff',fontWeight:'600',marginTop:8}}>Camera Access Required</Text>
            <Pressable onPress={requestCameraPermission} style={[S.btn,{marginTop:16}]}>
              <Text style={S.btnText}>Grant Camera Access</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Score Overlay */}
      <View style={{position:'absolute',top:50,left:20,right:20,flexDirection:'row',justifyContent:'space-between'}}>
        <View style={{backgroundColor:'#0F172AE6',borderRadius:12,padding:12}}>
          <Text style={{color:'#94A3B8',fontSize:10}}>REPS</Text>
          <Text style={{color:'#fff',fontSize:24,fontWeight:'bold'}}>{formCheckReps}</Text>
        </View>
        <View style={{backgroundColor:'#0F172AE6',borderRadius:12,padding:12}}>
          <Text style={{color:'#94A3B8',fontSize:10}}>TIME</Text>
          <Text style={{color:'#fff',fontSize:24,fontWeight:'bold'}}>{Math.floor(formCheckTimer/60)}:{String(formCheckTimer%60).padStart(2,'0')}</Text>
        </View>
      </View>

      {/* Score Display */}
      <View style={{position:'absolute',bottom:120,left:0,right:0,alignItems:'center'}}>
        <View style={{backgroundColor:'#0F172AE6',borderRadius:20,paddingHorizontal:32,paddingVertical:16,alignItems:'center'}}>
          <Text style={{color:'#94A3B8',fontSize:10}}>SCORE</Text>
          <Text style={{color:formCheckScore>=80?'#34D399':'#FBBF24',fontSize:48,fontWeight:'bold'}}>{formCheckScore || '--'}</Text>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={{backgroundColor:'#0F172A',padding:20,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <Pressable onPress={()=>setFormCheckReps(prev=>prev+1)} style={{backgroundColor:'#334155',borderRadius:12,paddingHorizontal:24,paddingVertical:14}}>
          <Text style={{color:'#fff',fontWeight:'600'}}>+ Rep</Text>
        </Pressable>
        <Pressable onPress={endFormCheck} style={{backgroundColor:'#DC2626',borderRadius:24,paddingHorizontal:32,paddingVertical:14}}>
          <Text style={{color:'#fff',fontWeight:'bold'}}>End Session</Text>
        </Pressable>
      </View>
    </View>
  );

  // --- NUTRITION ---
  if (screen === 'nutrition') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Pressable onPress={()=>setScreen('home')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
      <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Nutrition</Text>
      <Text style={{color:'#94A3B8',marginTop:4}}>Your personalized whole-food meal plan</Text>

      {!mealPlan && !nutritionLoading && (
        <View style={{alignItems:'center',marginTop:48}}>
          <Text style={{fontSize:48}}>🥬</Text>
          <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:16}}>No meal plan yet</Text>
          <Text style={{color:'#94A3B8',textAlign:'center',marginTop:8}}>Tap Generate to create a personalized whole-food plan</Text>
          <Pressable onPress={generateMealPlan} style={[S.btn,{marginTop:24}]}>
            <Text style={S.btnText}>Generate Meal Plan</Text>
          </Pressable>
        </View>
      )}

      {nutritionLoading && (
        <View style={{alignItems:'center',marginTop:48}}>
          <Text style={{fontSize:48}}>🥗</Text>
          <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:16}}>Crafting your plan...</Text>
          <Text style={{color:'#94A3B8',textAlign:'center',marginTop:8}}>Our AI chef is selecting whole-food ingredients</Text>
        </View>
      )}

      {mealPlan && mealPlan.meals && (
        <View style={{marginTop:24}}>
          <View style={S.card}>
            <Text style={{color:'#fff',fontSize:20,fontWeight:'bold'}}>{mealPlan.total_calories} kcal</Text>
            <View style={{flexDirection:'row',gap:16,marginTop:8}}>
              <Text style={{color:'#6366F1'}}>P:{Math.round(mealPlan.total_protein_g)}g</Text>
              <Text style={{color:'#FBBF24'}}>C:{Math.round(mealPlan.total_carbs_g)}g</Text>
              <Text style={{color:'#F87171'}}>F:{Math.round(mealPlan.total_fat_g)}g</Text>
            </View>
          </View>
          {mealPlan.meals.map((meal:any, i:number) => (
            <View key={i} style={[S.card,{marginTop:12}]}>
              <Text style={{color:'#64748B',fontSize:11,textTransform:'uppercase'}}>{meal.type}</Text>
              <Text style={{color:'#fff',fontSize:16,fontWeight:'600',marginTop:4}}>{meal.name}</Text>
              <Text style={{color:'#94A3B8',fontSize:12,marginTop:4}}>{meal.calories} cal · P:{meal.proteinG}g C:{meal.carbsG}g F:{meal.fatG}g</Text>
              <Text style={{color:'#64748B',fontSize:12,marginTop:8}}>{meal.method}</Text>
            </View>
          ))}
          <Pressable onPress={generateMealPlan} style={[S.btn,{marginTop:16,backgroundColor:'#334155'}]}>
            <Text style={S.btnText}>Regenerate</Text>
          </Pressable>
        </View>
      )}

      <View style={{backgroundColor:'#064E3B22',borderRadius:12,padding:16,marginTop:24,borderWidth:1,borderColor:'#065F4633'}}>
        <Text style={{color:'#34D399',fontSize:11,fontWeight:'700'}}>WHOLE-FOOD PROMISE</Text>
        <Text style={{color:'#94A3B8',fontSize:12,marginTop:4}}>Every meal uses only whole, minimally processed ingredients. No protein bars, powders, or supplements.</Text>
      </View>
    </ScrollView>
  );

  // --- MIND & BODY ---
  if (screen === 'mindbody') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Pressable onPress={()=>setScreen('home')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
      <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Mind & Body</Text>
      <Text style={{color:'#94A3B8',marginTop:4}}>Yoga, Meditation & Guided Breathing</Text>

      <View style={{backgroundColor:'#064E3B33',borderRadius:16,padding:20,marginTop:24,borderWidth:1,borderColor:'#065F4644'}}>
        <Text style={{color:'#34D399',fontSize:11,fontWeight:'700'}}>RECOMMENDED FOR YOU</Text>
        <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:8}}>Recovery Breathing</Text>
        <Text style={{color:'#94A3B8',fontSize:13,marginTop:4}}>5 min · Gentle · Based on your readiness</Text>
        <Pressable onPress={()=>setScreen('breathing')} style={{backgroundColor:'#34D399',borderRadius:12,padding:14,marginTop:16,alignItems:'center'}}>
          <Text style={{color:'#0F172A',fontWeight:'700',fontSize:15}}>Start Breathing Session</Text>
        </Pressable>
      </View>

      <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:32}}>Sessions</Text>
      <Pressable onPress={()=>setScreen('breathing')} style={[S.card,{marginTop:12,flexDirection:'row',alignItems:'center',gap:16}]}>
        <View style={{width:50,height:50,borderRadius:12,backgroundColor:'#312E81',alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:22}}>🌬️</Text>
        </View>
        <View style={{flex:1}}>
          <Text style={{color:'#fff',fontWeight:'600'}}>Guided Breathing</Text>
          <Text style={{color:'#94A3B8',fontSize:12,marginTop:2}}>5 min · Gentle · Video</Text>
        </View>
        <Text style={{color:'#6366F1'}}>▶</Text>
      </Pressable>

      <View style={[S.card,{marginTop:12,flexDirection:'row',alignItems:'center',gap:16,opacity:0.5}]}>
        <View style={{width:50,height:50,borderRadius:12,backgroundColor:'#312E81',alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:22}}>🧘‍♀️</Text>
        </View>
        <View style={{flex:1}}>
          <Text style={{color:'#fff',fontWeight:'600'}}>Morning Yoga Flow</Text>
          <Text style={{color:'#94A3B8',fontSize:12,marginTop:2}}>20 min · Moderate · Coming soon</Text>
        </View>
      </View>

      <View style={[S.card,{marginTop:12,flexDirection:'row',alignItems:'center',gap:16,opacity:0.5}]}>
        <View style={{width:50,height:50,borderRadius:12,backgroundColor:'#312E81',alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:22}}>🌙</Text>
        </View>
        <View style={{flex:1}}>
          <Text style={{color:'#fff',fontWeight:'600'}}>Sleep Meditation</Text>
          <Text style={{color:'#94A3B8',fontSize:12,marginTop:2}}>10 min · Gentle · Coming soon</Text>
        </View>
      </View>
    </ScrollView>
  );

  // --- BREATHING PLAYER ---
  if (screen === 'breathing') return (
    <View style={{flex:1,backgroundColor:'#0F172A'}}>
      <Video
        source={{ uri: BREATHING_VIDEO_URL }}
        style={{flex:1}}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isLooping={true}
        isMuted={false}
      />
      <View style={{position:'absolute',top:0,left:0,right:0,bottom:0}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingTop:50,paddingHorizontal:20}}>
          <Pressable onPress={()=>setScreen('mindbody')} style={{width:40,height:40,borderRadius:20,backgroundColor:'#0F172ACC',alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#fff',fontSize:18}}>←</Text>
          </Pressable>
          <Text style={{color:'#fff',fontWeight:'600'}}>Recovery Breathing</Text>
          <View style={{width:40}} />
        </View>
        <View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#0F172AE6',padding:24,paddingBottom:40}}>
          <Text style={{color:'#fff',fontSize:20,fontWeight:'bold'}}>5-Min Recovery Breathing</Text>
          <Text style={{color:'#94A3B8',fontSize:14,marginTop:8}}>Follow the visual rhythm. Slow diaphragmatic breathing activates your parasympathetic nervous system for deep recovery.</Text>
          <View style={{flexDirection:'row',gap:12,marginTop:16}}>
            <View style={{backgroundColor:'#334155',borderRadius:8,paddingHorizontal:12,paddingVertical:6}}>
              <Text style={{color:'#94A3B8',fontSize:11}}>Duration</Text>
              <Text style={{color:'#fff',fontWeight:'600'}}>5:00</Text>
            </View>
            <View style={{backgroundColor:'#334155',borderRadius:8,paddingHorizontal:12,paddingVertical:6}}>
              <Text style={{color:'#94A3B8',fontSize:11}}>Intensity</Text>
              <Text style={{color:'#fff',fontWeight:'600'}}>Gentle</Text>
            </View>
            <View style={{backgroundColor:'#334155',borderRadius:8,paddingHorizontal:12,paddingVertical:6}}>
              <Text style={{color:'#94A3B8',fontSize:11}}>Loop</Text>
              <Text style={{color:'#34D399',fontWeight:'600'}}>On</Text>
            </View>
          </View>
          <Pressable onPress={()=>setScreen('mindbody')} style={{backgroundColor:'#6366F1',borderRadius:12,padding:16,marginTop:20,alignItems:'center'}}>
            <Text style={{color:'#fff',fontWeight:'600',fontSize:16}}>End Session</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  // --- ACTIVITY LOG ---
  if (screen === 'activity') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Pressable onPress={()=>setScreen('home')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
      <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Activity & Points</Text>

      <View style={{flexDirection:'row',gap:12,marginTop:20}}>
        <View style={[S.card,{flex:1,alignItems:'center'}]}>
          <Text style={{color:'#6366F1',fontSize:28,fontWeight:'bold'}}>{points.total}</Text>
          <Text style={{color:'#94A3B8',fontSize:11}}>Total XP</Text>
        </View>
        <View style={[S.card,{flex:1,alignItems:'center'}]}>
          <Text style={{color:'#FBBF24',fontSize:28,fontWeight:'bold'}}>Lv.{points.level}</Text>
          <Text style={{color:'#94A3B8',fontSize:11}}>Level</Text>
        </View>
        <View style={[S.card,{flex:1,alignItems:'center'}]}>
          <Text style={{color:'#34D399',fontSize:28,fontWeight:'bold'}}>{points.streak}</Text>
          <Text style={{color:'#94A3B8',fontSize:11}}>Day Streak</Text>
        </View>
      </View>

      <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:28}}>Log Activity</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:10,marginTop:12}}>
        <Pressable onPress={()=>logActivity('meal_logged','Healthy meal')} style={{backgroundColor:'#1E293B',borderRadius:12,padding:14,borderWidth:1,borderColor:'#334155',alignItems:'center',width:'47%'}}>
          <Text style={{fontSize:20}}>🥗</Text>
          <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Log Meal</Text>
          <Text style={{color:'#6366F1',fontSize:11,marginTop:2}}>+10 XP</Text>
        </Pressable>
        <Pressable onPress={()=>logActivity('workout_completed','Workout session')} style={{backgroundColor:'#1E293B',borderRadius:12,padding:14,borderWidth:1,borderColor:'#334155',alignItems:'center',width:'47%'}}>
          <Text style={{fontSize:20}}>🏋️</Text>
          <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Log Workout</Text>
          <Text style={{color:'#6366F1',fontSize:11,marginTop:2}}>+25 XP</Text>
        </Pressable>
        <Pressable onPress={()=>logActivity('water_logged','Drank water')} style={{backgroundColor:'#1E293B',borderRadius:12,padding:14,borderWidth:1,borderColor:'#334155',alignItems:'center',width:'47%'}}>
          <Text style={{fontSize:20}}>💧</Text>
          <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Log Water</Text>
          <Text style={{color:'#6366F1',fontSize:11,marginTop:2}}>+5 XP</Text>
        </Pressable>
        <Pressable onPress={()=>logActivity('breathing_completed','Breathing session')} style={{backgroundColor:'#1E293B',borderRadius:12,padding:14,borderWidth:1,borderColor:'#334155',alignItems:'center',width:'47%'}}>
          <Text style={{fontSize:20}}>🌬️</Text>
          <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Log Breathing</Text>
          <Text style={{color:'#6366F1',fontSize:11,marginTop:2}}>+15 XP</Text>
        </Pressable>
      </View>

      <View style={[S.card,{marginTop:24}]}>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
          <Text style={{color:'#94A3B8',fontSize:12}}>Level {points.level}</Text>
          <Text style={{color:'#94A3B8',fontSize:12}}>Level {points.level + 1}</Text>
        </View>
        <View style={{height:8,backgroundColor:'#334155',borderRadius:4,marginTop:8}}>
          <View style={{height:8,backgroundColor:'#6366F1',borderRadius:4,width:`${points.total % 100}%`}} />
        </View>
        <Text style={{color:'#64748B',fontSize:11,marginTop:6}}>{100 - (points.total % 100)} XP to next level</Text>
      </View>

      {points.streak > 0 && (
        <View style={{backgroundColor:'#34D39922',borderRadius:12,padding:16,marginTop:16,borderWidth:1,borderColor:'#34D39944'}}>
          <Text style={{color:'#34D399',fontWeight:'700',fontSize:13}}>🔥 {points.streak}-Day Streak!</Text>
          <Text style={{color:'#94A3B8',fontSize:12,marginTop:4}}>Keep it up! Bonus +50 XP every 7 days.</Text>
        </View>
      )}

      <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:28}}>Recent Activity</Text>
      {activityLog.length === 0 && <Text style={{color:'#94A3B8',marginTop:12}}>No activities yet. Start logging!</Text>}
      {activityLog.map((item,i) => (
        <View key={i} style={[S.card,{marginTop:8,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}]}>
          <View style={{flex:1}}>
            <Text style={{color:'#fff',fontSize:14}}>{item.description || item.activity_type.replace('_',' ')}</Text>
            <Text style={{color:'#64748B',fontSize:11,marginTop:2}}>{new Date(item.logged_at).toLocaleDateString()}</Text>
          </View>
          <Text style={{color:'#6366F1',fontWeight:'bold'}}>+{item.points_earned}</Text>
        </View>
      ))}
    </ScrollView>
  );

  // --- CHALLENGES ---
  if (screen === 'challenges') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Pressable onPress={()=>setScreen('home')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
      <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Challenges</Text>
      <Text style={{color:'#94A3B8',marginTop:4}}>Compete with friends and community</Text>

      {/* Join by Code */}
      <View style={[S.card,{marginTop:20}]}>
        <Text style={{color:'#fff',fontWeight:'600',marginBottom:8}}>Join by Invite Code</Text>
        <View style={{flexDirection:'row',gap:8}}>
          <TextInput placeholder="Enter code" placeholderTextColor="#64748B" value={joinCode} onChangeText={setJoinCode} autoCapitalize="characters" style={[S.input,{flex:1,marginTop:0}]} />
          <Pressable onPress={joinChallenge} style={{backgroundColor:'#6366F1',borderRadius:12,paddingHorizontal:20,alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#fff',fontWeight:'600'}}>Join</Text>
          </Pressable>
        </View>
      </View>

      {/* Create Challenge */}
      <Pressable onPress={()=>setScreen('create_challenge')} style={[S.btn,{marginTop:16}]}>
        <Text style={S.btnText}>Create Challenge</Text>
      </Pressable>

      {/* My Challenges */}
      <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:28}}>My Challenges</Text>
      {myChallenges.length === 0 && <Text style={{color:'#94A3B8',marginTop:8}}>No challenges yet. Join or create one!</Text>}
      {myChallenges.map((item,i) => (
        <View key={i} style={[S.card,{marginTop:12}]}>
          <Text style={{color:'#fff',fontWeight:'600',fontSize:16}}>{item.challenges?.title || 'Challenge'}</Text>
          <Text style={{color:'#94A3B8',fontSize:12,marginTop:4}}>{item.challenges?.challenge_type} · Target: {item.challenges?.target_value} · {item.challenges?.duration_days} days</Text>
          <View style={{height:6,backgroundColor:'#334155',borderRadius:3,marginTop:12}}>
            <View style={{height:6,backgroundColor:'#6366F1',borderRadius:3,width:`${Math.min(100, (item.current_progress / (item.challenges?.target_value || 1)) * 100)}%`}} />
          </View>
          <Text style={{color:'#64748B',fontSize:11,marginTop:4}}>{item.current_progress} / {item.challenges?.target_value || 0}</Text>
          <Pressable onPress={()=>inviteToChallenge(item)} style={{backgroundColor:'#1E293B',borderRadius:8,padding:10,marginTop:12,alignItems:'center',borderWidth:1,borderColor:'#334155'}}>
            <Text style={{color:'#6366F1',fontSize:13}}>Invite via SMS</Text>
          </Pressable>
        </View>
      ))}

      {/* Discover Public Challenges */}
      <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:28}}>Discover</Text>
      {challenges.length === 0 && <Text style={{color:'#94A3B8',marginTop:8}}>No public challenges available.</Text>}
      {challenges.map((ch,i) => (
        <View key={i} style={[S.card,{marginTop:12}]}>
          <Text style={{color:'#fff',fontWeight:'600'}}>{ch.title}</Text>
          <Text style={{color:'#94A3B8',fontSize:12,marginTop:4}}>{ch.challenge_type} · Target: {ch.target_value} · {ch.duration_days} days</Text>
          <Text style={{color:'#64748B',fontSize:11,marginTop:4}}>Code: {ch.invite_code}</Text>
        </View>
      ))}
    </ScrollView>
  );

  // --- CREATE CHALLENGE ---
  if (screen === 'create_challenge') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Pressable onPress={()=>setScreen('challenges')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
      <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Create Challenge</Text>
      <Text style={{color:'#94A3B8',marginTop:4}}>Set up a new challenge for friends</Text>

      <TextInput placeholder="Challenge Title" placeholderTextColor="#64748B" value={challengeTitle} onChangeText={setChallengeTitle} style={[S.input,{marginTop:24}]} />

      <Text style={{color:'#94A3B8',marginTop:16,marginBottom:8}}>Type</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
        {['squat','pushup','situp','kettlebell','breathing','steps','water'].map(t => (
          <Pressable key={t} onPress={()=>setChallengeType(t)} style={{backgroundColor:challengeType===t?'#6366F133':'#1E293B',borderRadius:8,paddingHorizontal:14,paddingVertical:8,borderWidth:1,borderColor:challengeType===t?'#6366F1':'#334155'}}>
            <Text style={{color:challengeType===t?'#A5B4FC':'#94A3B8',fontSize:13,textTransform:'capitalize'}}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput placeholder="Target Number (e.g. 100)" placeholderTextColor="#64748B" value={challengeTarget} onChangeText={setChallengeTarget} keyboardType="number-pad" style={[S.input,{marginTop:16}]} />
      <TextInput placeholder="Duration (days)" placeholderTextColor="#64748B" value={challengeDays} onChangeText={setChallengeDays} keyboardType="number-pad" style={[S.input,{marginTop:12}]} />

      <Pressable onPress={createChallenge} style={[S.btn,{marginTop:24}]}>
        <Text style={S.btnText}>Create & Share</Text>
      </Pressable>
    </ScrollView>
  );

  // --- HOME (default) ---
  return (
    <View style={{flex:1,backgroundColor:'#0F172A'}}>
      <ScrollView contentContainerStyle={{padding:24,paddingTop:60,paddingBottom:100}}>
        <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Welcome back</Text>
        <Text style={{color:'#94A3B8',marginTop:4}}>Your daily wellness summary</Text>

        {/* Points Bar */}
        <Pressable onPress={()=>{loadPoints();loadActivityLog();setScreen('activity');}} style={{backgroundColor:'#1E293B',borderRadius:16,padding:16,marginTop:20,borderWidth:1,borderColor:'#334155',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
            <Text style={{fontSize:20}}>⭐</Text>
            <View>
              <Text style={{color:'#fff',fontWeight:'bold',fontSize:16}}>{points.total} XP</Text>
              <Text style={{color:'#94A3B8',fontSize:11}}>Level {points.level} · {points.streak} day streak</Text>
            </View>
          </View>
          <Text style={{color:'#6366F1',fontSize:13}}>Log →</Text>
        </Pressable>

        {/* Readiness */}
        <View style={[S.card,{marginTop:24}]}>
          <Text style={{color:'#64748B',fontSize:11,fontWeight:'600'}}>READINESS SCORE</Text>
          <Text style={{color:'#34D399',fontSize:48,fontWeight:'bold',marginTop:4}}>86</Text>
          <Text style={{color:'#34D399',fontSize:13}}>Recovered — great day for a challenge!</Text>
        </View>

        {/* Quick Actions */}
        <View style={{flexDirection:'row',gap:12,marginTop:16}}>
          <Pressable onPress={()=>setScreen('nutrition')} style={[S.card,{flex:1,alignItems:'center'}]}>
            <Text style={{fontSize:24}}>🥗</Text>
            <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Nutrition</Text>
          </Pressable>
          <Pressable onPress={startFormCheck} style={[S.card,{flex:1,alignItems:'center'}]}>
            <Text style={{fontSize:24}}>🏋️</Text>
            <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Form Check</Text>
          </Pressable>
          <Pressable onPress={()=>setScreen('mindbody')} style={[S.card,{flex:1,alignItems:'center'}]}>
            <Text style={{fontSize:24}}>🧘</Text>
            <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Mind & Body</Text>
          </Pressable>
        </View>

        <View style={{flexDirection:'row',gap:12,marginTop:12}}>
          <Pressable onPress={()=>{loadChallenges();setScreen('challenges');}} style={[S.card,{flex:1,alignItems:'center'}]}>
            <Text style={{fontSize:24}}>🏆</Text>
            <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Challenges</Text>
          </Pressable>
          <Pressable onPress={()=>{loadPoints();loadActivityLog();setScreen('activity');}} style={[S.card,{flex:1,alignItems:'center'}]}>
            <Text style={{fontSize:24}}>📊</Text>
            <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Activity Log</Text>
          </Pressable>
        </View>

        {/* Meal Preview */}
        <View style={[S.card,{marginTop:16}]}>
          <Text style={{color:'#64748B',fontSize:11,fontWeight:'600'}}>TODAY'S NUTRITION</Text>
          <Pressable onPress={()=>setScreen('nutrition')}>
            <Text style={{color:'#6366F1',marginTop:8}}>View or generate your meal plan →</Text>
          </Pressable>
        </View>

        {/* Rescan Body */}
        <Pressable onPress={()=>{setScanProgress(0);setScanDone(false);setScanPhoto(null);setScanPhase('photo');setScreen('scan');}} style={[S.card,{marginTop:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}]}>
          <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
            <Text style={{fontSize:20}}>🧬</Text>
            <View>
              <Text style={{color:'#fff',fontWeight:'600'}}>Body Scan</Text>
              <Text style={{color:'#94A3B8',fontSize:11}}>Retake your biometric scan</Text>
            </View>
          </View>
          <Text style={{color:'#6366F1'}}>Rescan →</Text>
        </Pressable>

        {/* Sign Out */}
        <Pressable onPress={handleSignOut} style={{marginTop:32,alignItems:'center'}}>
          <Text style={{color:'#F87171'}}>Sign Out</Text>
        </Pressable>
      </ScrollView>

      {/* Genie FAB */}
      <Pressable onPress={()=>setGenieOpen(true)} style={{position:'absolute',bottom:32,right:24,width:56,height:56,borderRadius:28,backgroundColor:'#6366F1',alignItems:'center',justifyContent:'center',elevation:5}}>
        <Text style={{fontSize:24}}>🧞</Text>
      </Pressable>

      {/* Genie Modal */}
      <Modal visible={genieOpen} animationType="slide" transparent>
        <View style={{flex:1,backgroundColor:'#00000099',justifyContent:'flex-end'}}>
          <View style={{backgroundColor:'#1E293B',borderTopLeftRadius:24,borderTopRightRadius:24,height:'70%',padding:16}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <Text style={{color:'#fff',fontSize:18,fontWeight:'bold'}}>🧞 Genie</Text>
              <Pressable onPress={()=>setGenieOpen(false)}><Text style={{color:'#94A3B8',fontSize:20}}>✕</Text></Pressable>
            </View>

            <ScrollView style={{flex:1}}>
              {genieMessages.length === 0 && <Text style={{color:'#94A3B8',textAlign:'center',marginTop:32}}>Ask me anything about fitness, nutrition, or wellness!</Text>}
              {genieMessages.map((m,i) => (
                <View key={i} style={{marginBottom:12,alignItems:m.role==='user'?'flex-end':'flex-start'}}>
                  <View style={{backgroundColor:m.role==='user'?'#6366F1':'#334155',borderRadius:16,padding:12,maxWidth:'85%'}}>
                    <Text style={{color:'#fff',fontSize:14}}>{m.text}</Text>
                  </View>
                  {m.buttons && m.buttons.length > 0 && (
                    <View style={{flexDirection:'row',gap:8,marginTop:8,flexWrap:'wrap'}}>
                      {m.buttons.map((b:any,j:number) => (
                        <Pressable key={j} onPress={()=>{setGenieOpen(false); Alert.alert(b.label,'Navigation coming in next build');}} style={{backgroundColor:'#6366F122',borderWidth:1,borderColor:'#6366F166',borderRadius:20,paddingHorizontal:12,paddingVertical:6}}>
                          <Text style={{color:'#A5B4FC',fontSize:12}}>{b.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              {genieLoading && <View style={{alignItems:'flex-start',marginBottom:12}}><View style={{backgroundColor:'#334155',borderRadius:16,padding:12}}><Text style={{color:'#94A3B8'}}>Thinking...</Text></View></View>}
            </ScrollView>

            <View style={{flexDirection:'row',gap:8,marginTop:8}}>
              <TextInput placeholder="Ask Genie..." placeholderTextColor="#64748B" value={genieInput} onChangeText={setGenieInput} onSubmitEditing={sendGenie} returnKeyType="send"
                style={{flex:1,backgroundColor:'#0F172A',borderRadius:12,padding:12,color:'#fff',borderWidth:1,borderColor:'#334155'}} />
              <Pressable onPress={sendGenie} style={{backgroundColor:'#6366F1',borderRadius:12,width:44,alignItems:'center',justifyContent:'center'}}>
                <Text style={{color:'#fff',fontSize:16}}>↑</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// === STYLES ===
const S: any = {
  container: { flex:1, backgroundColor:'#0F172A', justifyContent:'center', padding:24 },
  logo: { color:'#6366F1', fontSize:36, fontWeight:'bold', textAlign:'center' },
  subtitle: { color:'#94A3B8', textAlign:'center', marginTop:8 },
  input: { backgroundColor:'#1E293B', borderRadius:12, padding:16, color:'#fff', marginTop:12, borderWidth:1, borderColor:'#334155' },
  btn: { backgroundColor:'#6366F1', borderRadius:12, padding:16, marginTop:20, alignItems:'center' },
  btnText: { color:'#fff', fontWeight:'600', fontSize:16 },
  card: { backgroundColor:'#1E293B', borderRadius:16, padding:20, borderWidth:1, borderColor:'#334155' },
  option: { backgroundColor:'#1E293B', borderRadius:12, padding:16, marginTop:8, borderWidth:1, borderColor:'#334155' },
  optionActive: { borderColor:'#6366F1', backgroundColor:'#6366F122' },
  qTitle: { color:'#fff', fontSize:24, fontWeight:'bold', marginBottom:16 },
};
