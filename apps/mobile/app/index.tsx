import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tehezgpzecdblhebddoo.supabase.co',
  'sb_publishable_8ZGCicXame67Mn1TGcRyng_0jJ3sX-i'
);

type Screen = 'login' | 'register' | 'quiz' | 'scan' | 'home' | 'nutrition' | 'formcheck' | 'mindbody';

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
  const scanTimer = useRef<any>(null);

  // Nutrition state
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);

  // Check session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { setUser(data.session.user); setScreen('home'); }
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
    setScanProgress(0); setScanDone(false);
    let p = 0;
    scanTimer.current = setInterval(() => {
      p += 1.67;
      setScanProgress(Math.min(100, p));
      if (p >= 100) { clearInterval(scanTimer.current); setScanDone(true); }
    }, 1000);
  };

  const finishScan = async () => {
    if (!user) return;
    await supabase.from('user_biometric_profiles').insert({
      user_id: user.id, provider: 'simulation', measurements: { bmi: 23.5, body_fat_percentage: 18.2 }, confidence: 0.85,
    });
    await supabase.from('user_profiles').update({ onboarding_completed_at: new Date().toISOString() }).eq('id', user.id);
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
      {!scanDone ? (<>
        <View style={{width:200,height:200,borderRadius:100,borderWidth:4,borderColor:'#6366F1',alignItems:'center',justifyContent:'center'}}>
          <Text style={{color:'#fff',fontSize:36,fontWeight:'bold'}}>{Math.round(scanProgress)}%</Text>
          <Text style={{color:'#6366F1',fontSize:12,marginTop:4}}>{Math.floor(scanProgress*2.43)} measurements</Text>
        </View>
        <Text style={{color:'#fff',fontSize:20,fontWeight:'bold',marginTop:24}}>Scanning...</Text>
        <Text style={{color:'#94A3B8',marginTop:8,textAlign:'center'}}>Creating your Digital Twin biometric profile</Text>
      </>) : (<>
        <Text style={{fontSize:48}}>✓</Text>
        <Text style={{color:'#fff',fontSize:24,fontWeight:'bold',marginTop:16}}>Scan Complete!</Text>
        <Text style={{color:'#94A3B8',marginTop:8,textAlign:'center'}}>243 body measurements mapped</Text>
        <Pressable onPress={finishScan} style={[S.btn,{marginTop:32,width:'100%'}]}>
          <Text style={S.btnText}>Enter Become</Text>
        </Pressable>
      </>)}
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

  // --- HOME ---
  return (
    <View style={{flex:1,backgroundColor:'#0F172A'}}>
      <ScrollView contentContainerStyle={{padding:24,paddingTop:60,paddingBottom:100}}>
        <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Welcome back</Text>
        <Text style={{color:'#94A3B8',marginTop:4}}>Your daily wellness summary</Text>

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
          <Pressable onPress={()=>Alert.alert('Form Check','Camera-based form analysis coming in next build!')} style={[S.card,{flex:1,alignItems:'center'}]}>
            <Text style={{fontSize:24}}>🏋️</Text>
            <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Form Check</Text>
          </Pressable>
          <Pressable onPress={()=>Alert.alert('Mind & Body','Breathing video player coming in next build!')} style={[S.card,{flex:1,alignItems:'center'}]}>
            <Text style={{fontSize:24}}>🧘</Text>
            <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Mind & Body</Text>
          </Pressable>
        </View>

        {/* Meal Preview */}
        <View style={[S.card,{marginTop:16}]}>
          <Text style={{color:'#64748B',fontSize:11,fontWeight:'600'}}>TODAY'S NUTRITION</Text>
          <Pressable onPress={()=>setScreen('nutrition')}>
            <Text style={{color:'#6366F1',marginTop:8}}>View or generate your meal plan →</Text>
          </Pressable>
        </View>

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
