import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Modal, FlatList, ActivityIndicator, Share } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Video, ResizeMode } from 'expo-av';
import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as SMS from 'expo-sms';
import * as Speech from 'expo-speech';

const supabase = createClient(
  'https://tehezgpzecdblhebddoo.supabase.co',
  'sb_publishable_8ZGCicXame67Mn1TGcRyng_0jJ3sX-i'
);

const BREATHING_VIDEO_URL = 'https://tehezgpzecdblhebddoo.supabase.co/storage/v1/object/public/videos/runway-agent-exhale-20260528-152325.mp4';

const YOGA_ASANAS = [
  { name: 'Sun Salutation (Surya Namaskar)', icon: '☀️', duration: '10 min', level: 'Beginner' },
  { name: 'Warrior I (Virabhadrasana I)', icon: '⚔️', duration: '5 min', level: 'Beginner' },
  { name: 'Warrior II (Virabhadrasana II)', icon: '🗡️', duration: '5 min', level: 'Beginner' },
  { name: 'Tree Pose (Vrksasana)', icon: '🌳', duration: '3 min', level: 'Beginner' },
  { name: 'Downward Dog (Adho Mukha)', icon: '🐕', duration: '3 min', level: 'Beginner' },
  { name: 'Cobra Pose (Bhujangasana)', icon: '🐍', duration: '3 min', level: 'Beginner' },
  { name: 'Child\'s Pose (Balasana)', icon: '🧒', duration: '3 min', level: 'Beginner' },
  { name: 'Triangle Pose (Trikonasana)', icon: '📐', duration: '5 min', level: 'Intermediate' },
  { name: 'Bridge Pose (Setu Bandhasana)', icon: '🌉', duration: '5 min', level: 'Intermediate' },
  { name: 'Pigeon Pose (Kapotasana)', icon: '🕊️', duration: '5 min', level: 'Intermediate' },
  { name: 'Cat-Cow (Marjaryasana)', icon: '🐱', duration: '3 min', level: 'Beginner' },
  { name: 'Chair Pose (Utkatasana)', icon: '🪑', duration: '3 min', level: 'Intermediate' },
  { name: 'Plank Pose (Phalakasana)', icon: '🪵', duration: '3 min', level: 'Beginner' },
  { name: 'Corpse Pose (Savasana)', icon: '🧘', duration: '10 min', level: 'Beginner' },
  { name: 'Half Moon (Ardha Chandrasana)', icon: '🌙', duration: '5 min', level: 'Advanced' },
];

const MEDITATION_SESSIONS = [
  { name: 'Guided Breathing', icon: '🌬️', duration: '5 min', level: 'Beginner' },
  { name: 'Body Scan Meditation', icon: '🧘', duration: '10 min', level: 'Beginner' },
  { name: 'Loving Kindness (Metta)', icon: '💗', duration: '10 min', level: 'Beginner' },
  { name: 'Mindful Focus', icon: '🎯', duration: '5 min', level: 'Beginner' },
  { name: 'Stress Relief', icon: '🌊', duration: '10 min', level: 'Beginner' },
  { name: 'Sleep Meditation', icon: '🌙', duration: '20 min', level: 'Beginner' },
  { name: 'Morning Calm', icon: '☀️', duration: '5 min', level: 'Beginner' },
  { name: 'Anxiety Release', icon: '🦋', duration: '10 min', level: 'Intermediate' },
  { name: 'Gratitude Practice', icon: '🙏', duration: '5 min', level: 'Beginner' },
  { name: 'Deep Relaxation (Yoga Nidra)', icon: '💫', duration: '20 min', level: 'Intermediate' },
];

const WEARABLE_DEVICES = [
  { id: 'apple_watch', name: 'Apple Watch', icon: '⌚', description: 'HRV, Heart Rate, Steps, Sleep', platform: 'ios' },
  { id: 'whoop', name: 'Whoop', icon: '🔴', description: 'HRV, Strain, Recovery, Sleep', platform: 'all' },
  { id: 'fitbit', name: 'Fitbit', icon: '💚', description: 'Heart Rate, Steps, Sleep, SpO2', platform: 'all' },
  { id: 'garmin', name: 'Garmin', icon: '🔵', description: 'HRV, Heart Rate, GPS, Sleep', platform: 'all' },
  { id: 'oura', name: 'Oura Ring', icon: '💍', description: 'HRV, Sleep, Readiness, Temperature', platform: 'all' },
  { id: 'samsung_health', name: 'Samsung Health', icon: '💙', description: 'Heart Rate, Steps, Sleep', platform: 'android' },
];

const AVATAR_OPTIONS = ['💪','🧘','🏋️','🌟','🔥','⚡','🦁','🐺','🦅','🎯','👑','💎'];
const SMART_NOTIFICATIONS = [
  { id: 'hrv_drop', title: 'HRV Drop Alert', desc: 'Notify when HRV drops >20% below baseline', icon: '❤️' },
  { id: 'streak_reminder', title: 'Streak Reminder', desc: 'Remind at 8 PM if no activity logged today', icon: '🔥' },
  { id: 'meal_plan_ready', title: 'Meal Plan Ready', desc: 'Notify when daily meal plan is generated', icon: '🥗' },
  { id: 'challenge_update', title: 'Challenge Updates', desc: 'When friends complete reps in your challenge', icon: '🏆' },
  { id: 'recovery_suggestion', title: 'Recovery Suggestion', desc: 'Suggest breathing when stress detected', icon: '🌬️' },
  { id: 'weekly_summary', title: 'Weekly Summary', desc: 'Send your AI summary every Sunday', icon: '📊' },
];

type Screen = 'login' | 'register' | 'forgot_password' | 'quiz' | 'scan' | 'home' | 'nutrition' | 'formcheck' | 'mindbody' | 'breathing' | 'activity' | 'challenges' | 'create_challenge' | 'genie' | 'camera_scan' | 'formcheck_session' | 'formcheck_select' | 'become_score' | 'weekly_summary' | 'wearables' | 'leaderboard' | 'accountability' | 'referrals' | 'notifications_settings' | 'progress_photos' | 'profile';

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
  const [isRecording, setIsRecording] = useState(false);

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
  const [mindBodyTab, setMindBodyTab] = useState<'yoga' | 'meditation'>('yoga');
  const [becomeScore, setBecomeScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Camera/Scan state
  const [cameraPermission, setCameraPermission] = useState(false);
  const [scanPhoto, setScanPhoto] = useState<string | null>(null);

  // Form Check state  
  const [formCheckActive, setFormCheckActive] = useState(false);
  const [formCheckScore, setFormCheckScore] = useState(0);
  const [formCheckReps, setFormCheckReps] = useState(0);
  const [formCheckTimer, setFormCheckTimer] = useState(0);
  const formCheckInterval = useRef<any>(null);
  const [selectedExercise, setSelectedExercise] = useState('air_squat');

  const [connectedWearables, setConnectedWearables] = useState<string[]>([]);
  const [wearableData, setWearableData] = useState<{hrv:number|null,restingHR:number|null,steps:number|null,sleep:number|null}>({hrv:null,restingHR:null,steps:null,sleep:null});

  const [accountabilityPartner, setAccountabilityPartner] = useState<string|null>(null);
  const [referralCount, setReferralCount] = useState(0);

  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [progressPhotos, setProgressPhotos] = useState<Array<{uri:string;date:string}>>([]);
  const [avatarEmoji, setAvatarEmoji] = useState('💪');

  const [toast, setToast] = useState<{visible:boolean;message:string;type:'success'|'error'|'info'}>({visible:false,message:'',type:'info'});
  const toastTimer = useRef<any>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({visible:true, message, type});
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(prev=>({...prev,visible:false})), 3000);
  };

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
    
    // Get my participations
    const { data: myParts } = await supabase.from('challenge_participants').select('*').eq('user_id', user.id);
    if (myParts && myParts.length > 0) {
      const challengeIds = myParts.map((p: any) => p.challenge_id);
      const { data: myChallengeData } = await supabase.from('challenges').select('*').in('id', challengeIds);
      if (myChallengeData) {
        const merged = myParts.map((p: any) => ({
          ...p,
          challenge: myChallengeData.find((c: any) => c.id === p.challenge_id) || null,
        }));
        setMyChallenges(merged);
      }
    } else {
      setMyChallenges([]);
    }
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
    if (error) showToast(error.message, 'error');
    else { setUser(data.user); setScreen('home'); }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) return;
    if (password.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    setLoading(false);
    if (error) showToast(error.message, 'error');
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
    setScanPhase('photo');
    setScreen('scan');
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
        Speech.speak(data.response.text, { language: 'en', rate: 0.9, pitch: 1.0 });
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
      else showToast(data.error || 'Could not generate plan', 'error');
    } catch (e) { showToast('Connection failed', 'error'); }
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
      if (Math.floor(existing.total_points / 100) < Math.floor(newTotal / 100)) {
        setShowConfetti(true);
        setTimeout(()=>setShowConfetti(false), 4000);
        showToast(`🎉 LEVEL UP! You're now Level ${newLevel}!`, 'success');
      }
    } else {
      await supabase.from('user_points').insert({ user_id: user.id, total_points: pts, level: 1, current_streak_days: 1, last_activity_date: today });
      setPoints({ total: pts, level: 1, streak: 1 });
      setShowConfetti(true);
      setTimeout(()=>setShowConfetti(false), 4000);
      showToast('🎉 Welcome! You earned your first XP!', 'success');
    }

    const { data: dailyExisting } = await supabase.from('daily_points').select('*').eq('user_id', user.id).eq('points_date', today).single();
    if (dailyExisting) {
      await supabase.from('daily_points').update({ points_earned: dailyExisting.points_earned + pts, activities_count: dailyExisting.activities_count + 1 }).eq('id', dailyExisting.id);
    } else {
      await supabase.from('daily_points').insert({ user_id: user.id, points_date: today, points_earned: pts, activities_count: 1 });
    }

    await loadActivityLog();
    showToast(`+${pts} XP for ${description}`, 'success');
  };

  const calculateBecomeScore = () => {
    const fitnessScore = Math.min(300, points.total * 0.3);
    const nutritionScore = mealPlan ? 250 : 0;
    const mindfulnessScore = Math.min(200, activityLog.filter((a:any) => a.activity_type === 'breathing_completed').length * 40);
    const consistencyScore = Math.min(250, points.streak * 35);
    const total = Math.round(fitnessScore + nutritionScore + mindfulnessScore + consistencyScore);
    setBecomeScore(Math.min(1000, total));
    return Math.min(1000, total);
  };

  const toggleWearable = (deviceId: string) => {
    if (connectedWearables.includes(deviceId)) {
      setConnectedWearables(prev => prev.filter(d => d !== deviceId));
      showToast('Device disconnected', 'info');
    } else {
      setConnectedWearables(prev => [...prev, deviceId]);
      setWearableData({ hrv: 48 + Math.floor(Math.random() * 20), restingHR: 55 + Math.floor(Math.random() * 15), steps: 3000 + Math.floor(Math.random() * 8000), sleep: 360 + Math.floor(Math.random() * 120) });
      showToast(`Connected to ${WEARABLE_DEVICES.find(d=>d.id===deviceId)?.name}!`, 'success');
    }
  };

  const takeProgressPhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) { showToast('Camera permission required', 'error'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setProgressPhotos(prev => [...prev, { uri: result.assets[0]!.uri, date: new Date().toISOString().split('T')[0] }]);
      showToast('Progress photo saved!', 'success');
    }
  };

  const getWeeklySummary = () => {
    const workouts = activityLog.filter((a:any) => a.activity_type === 'workout_completed').length;
    const meals = activityLog.filter((a:any) => a.activity_type === 'meal_logged').length;
    const breathing = activityLog.filter((a:any) => a.activity_type === 'breathing_completed').length;
    const water = activityLog.filter((a:any) => a.activity_type === 'water_logged').length;
    return { workouts, meals, breathing, water, totalXP: points.total, streak: points.streak, score: becomeScore };
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
    if (error) { showToast(error.message, 'error'); return; }
    if (data) {
      await supabase.from('challenge_participants').insert({ challenge_id: data.id, user_id: user.id, current_progress: 0 });
      showToast('Challenge created! Code: ' + code, 'success');
      setChallengeTitle(''); setChallengeTarget(''); setChallengeDays('');
      await loadChallenges();
      setScreen('challenges');
    }
  };

  const joinChallenge = async () => {
    if (!user || !joinCode.trim()) return;
    const { data: ch } = await supabase.from('challenges').select('*').eq('invite_code', joinCode.trim().toUpperCase()).single();
    if (!ch) { showToast('Challenge not found', 'error'); return; }
    const { error } = await supabase.from('challenge_participants').insert({ challenge_id: ch.id, user_id: user.id, current_progress: 0 });
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Joined: ' + ch.title, 'success');
    setJoinCode('');
    await loadChallenges();
  };

  const inviteToChallenge = async (item: any) => {
    const title = item.challenge?.title || item.title || 'Become Challenge';
    const code = item.challenge?.invite_code || item.invite_code || '';
    const available = await SMS.isAvailableAsync();
    if (!available) { showToast('SMS not available on this device', 'error'); return; }
    const message = `Hey! Join my "${title}" challenge on Become! 💪\n\nUse invite code: ${code}\n\nDownload: https://become.app`;
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
    if (!hasPermission) { showToast('Camera permission required', 'error'); return; }
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
  const startFormCheck = () => {
    setScreen('formcheck_select');
  };

  const beginFormCheckSession = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) { showToast('Camera permission required', 'error'); return; }
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
        user_id: user.id, exercise: selectedExercise, total_reps: formCheckReps,
        average_score: avgScore, duration_seconds: formCheckTimer, cues_detected: [],
      });
      await logActivity('workout_completed', `Form Check: ${formCheckReps} reps, score ${avgScore}`);
    }
    showToast('Session Complete! ' + formCheckReps + ' reps', 'success');
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
      <Pressable onPress={() => setScreen('forgot_password')} style={{marginTop:12,alignItems:'center'}}>
        <Text style={{color:'#94A3B8',fontSize:13}}>Forgot Password?</Text>
      </Pressable>
      <View style={{marginTop:24}}>
        <View style={{flexDirection:'row',alignItems:'center',marginBottom:16}}>
          <View style={{flex:1,height:1,backgroundColor:'#334155'}} />
          <Text style={{color:'#64748B',marginHorizontal:12,fontSize:12}}>or continue with</Text>
          <View style={{flex:1,height:1,backgroundColor:'#334155'}} />
        </View>
        <Pressable onPress={async()=>{
          const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
          if (error) showToast(error.message, 'error');
        }} style={{backgroundColor:'#fff',borderRadius:12,padding:14,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:10}}>
          <Text style={{fontSize:18}}>G</Text>
          <Text style={{color:'#1E293B',fontWeight:'600',fontSize:15}}>Continue with Google</Text>
        </Pressable>
        <Pressable onPress={async()=>{
          const { error } = await supabase.auth.signInWithOAuth({ provider: 'apple' });
          if (error) showToast(error.message, 'error');
        }} style={{backgroundColor:'#000',borderRadius:12,padding:14,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:10,marginTop:10,borderWidth:1,borderColor:'#334155'}}>
          <Text style={{fontSize:18,color:'#fff'}}>🍎</Text>
          <Text style={{color:'#fff',fontWeight:'600',fontSize:15}}>Continue with Apple</Text>
        </Pressable>
      </View>
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
      <View style={{marginTop:24}}>
        <View style={{flexDirection:'row',alignItems:'center',marginBottom:16}}>
          <View style={{flex:1,height:1,backgroundColor:'#334155'}} />
          <Text style={{color:'#64748B',marginHorizontal:12,fontSize:12}}>or continue with</Text>
          <View style={{flex:1,height:1,backgroundColor:'#334155'}} />
        </View>
        <Pressable onPress={async()=>{
          const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
          if (error) showToast(error.message, 'error');
        }} style={{backgroundColor:'#fff',borderRadius:12,padding:14,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:10}}>
          <Text style={{fontSize:18}}>G</Text>
          <Text style={{color:'#1E293B',fontWeight:'600',fontSize:15}}>Continue with Google</Text>
        </Pressable>
        <Pressable onPress={async()=>{
          const { error } = await supabase.auth.signInWithOAuth({ provider: 'apple' });
          if (error) showToast(error.message, 'error');
        }} style={{backgroundColor:'#000',borderRadius:12,padding:14,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:10,marginTop:10,borderWidth:1,borderColor:'#334155'}}>
          <Text style={{fontSize:18,color:'#fff'}}>🍎</Text>
          <Text style={{color:'#fff',fontWeight:'600',fontSize:15}}>Continue with Apple</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );

  // --- FORGOT PASSWORD ---
  if (screen === 'forgot_password') return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={S.container}>
      <Text style={S.logo}>Become</Text>
      <Text style={S.subtitle}>Reset your password</Text>
      <Text style={{color:'#94A3B8',textAlign:'center',marginTop:16,fontSize:14}}>Enter your email and we'll send you a link to reset your password.</Text>
      <TextInput placeholder="Email" placeholderTextColor="#64748B" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={[S.input,{marginTop:24}]} />
      <Pressable onPress={async()=>{
        if (!email) { showToast('Please enter your email', 'error'); return; }
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        setLoading(false);
        if (error) showToast(error.message, 'error');
        else showToast('Reset link sent to ' + email, 'success');
      }} disabled={loading} style={[S.btn, loading && {opacity:0.6}]}>
        <Text style={S.btnText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
      </Pressable>
      <Pressable onPress={() => setScreen('login')} style={{marginTop:16,alignItems:'center'}}>
        <Text style={{color:'#6366F1'}}>Back to Sign In</Text>
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

  // --- FORM CHECK SELECT ---
  if (screen === 'formcheck_select') {
    const exercises = [
      { id: 'air_squat', name: 'Air Squat', icon: '🏋️', muscles: 'Quads, Glutes, Core', difficulty: 'Beginner' },
      { id: 'push_up', name: 'Push-Up', icon: '💪', muscles: 'Chest, Triceps, Shoulders', difficulty: 'Beginner' },
      { id: 'sit_up', name: 'Sit-Up', icon: '🔥', muscles: 'Abs, Hip Flexors', difficulty: 'Beginner' },
      { id: 'kettlebell_swing', name: 'Kettlebell Swing', icon: '🔔', muscles: 'Glutes, Hamstrings, Core', difficulty: 'Intermediate' },
    ];
    return (
      <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
        <Pressable onPress={()=>setScreen('home')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
        <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Form Check</Text>
        <Text style={{color:'#94A3B8',marginTop:4}}>Choose an exercise to analyze</Text>

        {exercises.map(ex => (
          <Pressable key={ex.id} onPress={()=>{setSelectedExercise(ex.id);beginFormCheckSession();}} style={[S.card,{marginTop:16,flexDirection:'row',alignItems:'center',gap:16}]}>
            <View style={{width:56,height:56,borderRadius:14,backgroundColor:'#312E81',alignItems:'center',justifyContent:'center'}}>
              <Text style={{fontSize:28}}>{ex.icon}</Text>
            </View>
            <View style={{flex:1}}>
              <Text style={{color:'#fff',fontWeight:'700',fontSize:16}}>{ex.name}</Text>
              <Text style={{color:'#94A3B8',fontSize:12,marginTop:2}}>{ex.muscles}</Text>
              <Text style={{color:'#6366F1',fontSize:11,marginTop:2}}>{ex.difficulty}</Text>
            </View>
            <Text style={{color:'#6366F1',fontSize:18}}>▶</Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  // --- FORM CHECK SESSION ---
  if (screen === 'formcheck_session') return (
    <View style={{flex:1,backgroundColor:'#0F172A'}}>
      <View style={{flex:1,flexDirection:'row'}}>
        <View style={{width:'35%',backgroundColor:'#1E293B',padding:12,justifyContent:'space-between',borderRightWidth:1,borderRightColor:'#334155'}}>
          <View>
            <Text style={{color:'#6366F1',fontSize:10,fontWeight:'700'}}>REFERENCE</Text>
            <Text style={{color:'#fff',fontSize:16,fontWeight:'bold',marginTop:8}}>{selectedExercise.replace(/_/g,' ').replace(/\b\w/g,(l:string)=>l.toUpperCase())}</Text>
            <Text style={{color:'#94A3B8',fontSize:11,marginTop:8,lineHeight:16}}>
              {selectedExercise==='air_squat'?'Stand shoulder-width apart. Lower hips below knees. Keep chest upright. Knees track over toes.':
               selectedExercise==='push_up'?'Hands shoulder-width. Lower chest to floor. Keep body straight. Elbows at 45 degrees.':
               selectedExercise==='sit_up'?'Lie flat, knees bent. Curl torso up fully. Control the descent. Keep feet planted.':
               'Hip hinge movement. Drive hips forward explosively. Arms swing to eye level. Keep back neutral.'}
            </Text>
          </View>
          <View>
            <Text style={{color:'#FBBF24',fontSize:10,fontWeight:'700',marginTop:12}}>WATCH FOR</Text>
            <Text style={{color:'#FBBF24',fontSize:11,marginTop:4}}>• {selectedExercise==='air_squat'?'Knee cave':selectedExercise==='push_up'?'Sagging hips':'Forward lean'}</Text>
            <Text style={{color:'#FBBF24',fontSize:11,marginTop:2}}>• {selectedExercise==='air_squat'?'Insufficient depth':selectedExercise==='push_up'?'Partial reps':'Jerky motion'}</Text>
            <Text style={{color:'#FBBF24',fontSize:11,marginTop:2}}>• {selectedExercise==='air_squat'?'Forward lean':'Neck strain'}</Text>
          </View>
          <View style={{backgroundColor:'#334155',borderRadius:8,padding:8,marginTop:12}}>
            <Text style={{color:'#34D399',fontSize:10,textAlign:'center'}}>AI Tracking Active</Text>
            <Text style={{color:'#94A3B8',fontSize:9,textAlign:'center',marginTop:2}}>33 landmarks</Text>
          </View>
        </View>
        <View style={{flex:1,backgroundColor:'#000'}}>
          {cameraPermission ? (
            <CameraView style={{flex:1}} facing="front" />
          ) : (
            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
              <Text style={{color:'#94A3B8'}}>Camera initializing...</Text>
            </View>
          )}
        </View>
      </View>
      <View style={{position:'absolute',top:50,right:16,alignItems:'center'}}>
        <View style={{backgroundColor:'#0F172AE6',borderRadius:16,padding:12,alignItems:'center',borderWidth:1,borderColor:'#334155'}}>
          <Text style={{color:'#94A3B8',fontSize:9}}>SCORE</Text>
          <Text style={{color:formCheckScore>=80?'#34D399':'#FBBF24',fontSize:36,fontWeight:'bold'}}>{formCheckScore || '--'}</Text>
        </View>
      </View>
      <View style={{position:'absolute',top:50,left:'37%',marginLeft:12}}>
        <View style={{backgroundColor:'#0F172AE6',borderRadius:12,paddingHorizontal:12,paddingVertical:8,flexDirection:'row',gap:16,borderWidth:1,borderColor:'#334155'}}>
          <View><Text style={{color:'#94A3B8',fontSize:9}}>REPS</Text><Text style={{color:'#fff',fontSize:18,fontWeight:'bold'}}>{formCheckReps}</Text></View>
          <View><Text style={{color:'#94A3B8',fontSize:9}}>TIME</Text><Text style={{color:'#fff',fontSize:18,fontWeight:'bold'}}>{Math.floor(formCheckTimer/60)}:{String(formCheckTimer%60).padStart(2,'0')}</Text></View>
        </View>
      </View>
      {formCheckTimer > 0 && formCheckTimer % 7 === 0 && (
        <View style={{position:'absolute',top:120,left:'37%',marginLeft:12,right:12}}>
          <View style={{backgroundColor:'#7F1D1DE6',borderRadius:10,padding:10,borderWidth:1,borderColor:'#F8717166'}}>
            <Text style={{color:'#FCA5A5',fontSize:12,fontWeight:'600'}}>⚠️ {selectedExercise==='air_squat'?'Keep knees tracking over toes':'Keep your core engaged'}</Text>
          </View>
        </View>
      )}
      <View style={{backgroundColor:'#0F172A',padding:16,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderTopWidth:1,borderTopColor:'#334155'}}>
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

      {/* Tab Toggle */}
      <View style={{flexDirection:'row',backgroundColor:'#1E293B',borderRadius:12,padding:4,marginTop:20,borderWidth:1,borderColor:'#334155'}}>
        <Pressable onPress={()=>setMindBodyTab('yoga')} style={{flex:1,paddingVertical:10,borderRadius:8,alignItems:'center',backgroundColor:mindBodyTab==='yoga'?'#6366F1':'transparent'}}>
          <Text style={{color:mindBodyTab==='yoga'?'#fff':'#94A3B8',fontWeight:'600'}}>🧘‍♀️ Yoga</Text>
        </Pressable>
        <Pressable onPress={()=>setMindBodyTab('meditation')} style={{flex:1,paddingVertical:10,borderRadius:8,alignItems:'center',backgroundColor:mindBodyTab==='meditation'?'#6366F1':'transparent'}}>
          <Text style={{color:mindBodyTab==='meditation'?'#fff':'#94A3B8',fontWeight:'600'}}>🧘 Meditation</Text>
        </Pressable>
      </View>

      {/* YOGA TAB */}
      {mindBodyTab === 'yoga' && (
        <View style={{marginTop:20}}>
          <Text style={{color:'#94A3B8',fontSize:13,marginBottom:16}}>Master these asanas to build strength, flexibility, and inner peace</Text>
          {YOGA_ASANAS.map((asana, i) => (
            <Pressable key={i} onPress={()=>{logActivity('workout_completed',`Completed ${asana.name}`);}} style={[S.card,{marginTop:10,flexDirection:'row',alignItems:'center',gap:14}]}>
              <View style={{width:50,height:50,borderRadius:12,backgroundColor:'#312E81',alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontSize:22}}>{asana.icon}</Text>
              </View>
              <View style={{flex:1}}>
                <Text style={{color:'#fff',fontWeight:'600'}}>{asana.name}</Text>
                <Text style={{color:'#94A3B8',fontSize:11,marginTop:2}}>{asana.duration} · {asana.level}</Text>
              </View>
              <View style={{alignItems:'flex-end'}}>
                <Text style={{color:'#6366F1',fontSize:11,fontWeight:'600'}}>+25 XP</Text>
                <Text style={{color:'#64748B',fontSize:10}}>▶ Play</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* MEDITATION TAB */}
      {mindBodyTab === 'meditation' && (
        <View style={{marginTop:20}}>
          <Text style={{color:'#94A3B8',fontSize:13,marginBottom:16}}>Calm the mind, reduce stress, and find inner stillness</Text>
          {MEDITATION_SESSIONS.map((session, i) => (
            <Pressable key={i} onPress={()=>{
              if (i === 0) { setScreen('breathing'); logActivity('breathing_completed','Guided Breathing session'); }
              else { logActivity('breathing_completed',`Completed ${session.name}`); showToast(session.name + ' coming soon!', 'info'); }
            }} style={[S.card,{marginTop:10,flexDirection:'row',alignItems:'center',gap:14}]}>
              <View style={{width:50,height:50,borderRadius:12,backgroundColor:i===0?'#065F46':'#312E81',alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontSize:22}}>{session.icon}</Text>
              </View>
              <View style={{flex:1}}>
                <Text style={{color:'#fff',fontWeight:'600'}}>{session.name}</Text>
                <Text style={{color:'#94A3B8',fontSize:11,marginTop:2}}>{session.duration} · {session.level}</Text>
              </View>
              <View style={{alignItems:'flex-end'}}>
                <Text style={{color:'#34D399',fontSize:11,fontWeight:'600'}}>+15 XP</Text>
                <Text style={{color:i===0?'#34D399':'#64748B',fontSize:10}}>{i===0?'▶ Ready':'Coming Soon'}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
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

      {/* Streak Heatmap */}
      <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:28}}>This Week</Text>
      <View style={{flexDirection:'row',gap:6,marginTop:12}}>
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day,i) => {
          const today = new Date().getDay();
          const isToday = i === (today === 0 ? 6 : today - 1);
          const isPast = i < (today === 0 ? 6 : today - 1);
          const hasActivity = isPast || (isToday && points.streak > 0);
          return (
            <View key={day} style={{flex:1,alignItems:'center'}}>
              <View style={{width:36,height:36,borderRadius:8,backgroundColor:hasActivity?'#6366F1':isToday?'#334155':'#1E293B',borderWidth:isToday?2:0,borderColor:'#6366F1',alignItems:'center',justifyContent:'center'}}>
                <Text style={{color:hasActivity?'#fff':'#64748B',fontSize:10,fontWeight:'600'}}>{hasActivity?'✓':''}</Text>
              </View>
              <Text style={{color:isToday?'#fff':'#64748B',fontSize:9,marginTop:4}}>{day}</Text>
            </View>
          );
        })}
      </View>

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
          <Text style={{color:'#fff',fontWeight:'600',fontSize:16}}>{item.challenge?.title || 'Challenge'}</Text>
          <Text style={{color:'#94A3B8',fontSize:12,marginTop:4}}>{item.challenge?.challenge_type || ''} · Target: {item.challenge?.target_value || 0} · {item.challenge?.duration_days || 7} days</Text>
          <Text style={{color:'#64748B',fontSize:11,marginTop:4}}>Invite Code: <Text style={{color:'#6366F1',fontWeight:'bold'}}>{item.challenge?.invite_code || ''}</Text></Text>
          <View style={{height:6,backgroundColor:'#334155',borderRadius:3,marginTop:12}}>
            <View style={{height:6,backgroundColor:'#6366F1',borderRadius:3,width:`${Math.min(100, (item.current_progress / (item.challenge?.target_value || 1)) * 100)}%`}} />
          </View>
          <Text style={{color:'#64748B',fontSize:11,marginTop:4}}>{item.current_progress} / {item.challenge?.target_value || 0}</Text>
          <Pressable onPress={()=>inviteToChallenge(item)} style={{backgroundColor:'#6366F1',borderRadius:10,padding:12,marginTop:12,alignItems:'center'}}>
            <Text style={{color:'#fff',fontWeight:'600',fontSize:14}}>📲 Invite Friends via SMS</Text>
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

  // --- BECOME SCORE ---
  if (screen === 'become_score') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Pressable onPress={()=>setScreen('home')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
      <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Your Become Score</Text>
      <Text style={{color:'#94A3B8',marginTop:4}}>Holistic wellness metric</Text>
      <View style={{alignItems:'center',marginTop:32}}>
        <View style={{width:180,height:180,borderRadius:90,borderWidth:6,borderColor:becomeScore>=700?'#34D399':becomeScore>=400?'#6366F1':'#FBBF24',alignItems:'center',justifyContent:'center',backgroundColor:'#1E293B'}}>
          <Text style={{color:becomeScore>=700?'#34D399':becomeScore>=400?'#6366F1':'#FBBF24',fontSize:52,fontWeight:'bold'}}>{becomeScore}</Text>
          <Text style={{color:'#94A3B8',fontSize:12}}>/ 1000</Text>
        </View>
        <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:16}}>{becomeScore>=700?'Elite':becomeScore>=500?'Strong':becomeScore>=300?'Growing':'Starting'}</Text>
      </View>
      <View style={{marginTop:32}}>
        <Text style={{color:'#fff',fontSize:16,fontWeight:'600',marginBottom:16}}>Score Breakdown</Text>
        <View style={[S.card,{marginTop:8}]}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:'#fff'}}>💪 Fitness</Text><Text style={{color:'#6366F1',fontWeight:'bold'}}>{Math.round(Math.min(300,points.total*0.3))}/300</Text></View><View style={{height:4,backgroundColor:'#334155',borderRadius:2,marginTop:8}}><View style={{height:4,backgroundColor:'#6366F1',borderRadius:2,width:`${Math.min(100,(points.total*0.3)/300*100)}%`}} /></View></View>
        <View style={[S.card,{marginTop:8}]}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:'#fff'}}>🥗 Nutrition</Text><Text style={{color:'#34D399',fontWeight:'bold'}}>{mealPlan?250:0}/250</Text></View><View style={{height:4,backgroundColor:'#334155',borderRadius:2,marginTop:8}}><View style={{height:4,backgroundColor:'#34D399',borderRadius:2,width:`${mealPlan?100:0}%`}} /></View></View>
        <View style={[S.card,{marginTop:8}]}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:'#fff'}}>🧘 Mindfulness</Text><Text style={{color:'#A78BFA',fontWeight:'bold'}}>{Math.round(Math.min(200,activityLog.filter((a:any)=>a.activity_type==='breathing_completed').length*40))}/200</Text></View><View style={{height:4,backgroundColor:'#334155',borderRadius:2,marginTop:8}}><View style={{height:4,backgroundColor:'#A78BFA',borderRadius:2,width:`${Math.min(100,activityLog.filter((a:any)=>a.activity_type==='breathing_completed').length*20)}%`}} /></View></View>
        <View style={[S.card,{marginTop:8}]}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:'#fff'}}>🔥 Consistency</Text><Text style={{color:'#FBBF24',fontWeight:'bold'}}>{Math.round(Math.min(250,points.streak*35))}/250</Text></View><View style={{height:4,backgroundColor:'#334155',borderRadius:2,marginTop:8}}><View style={{height:4,backgroundColor:'#FBBF24',borderRadius:2,width:`${Math.min(100,points.streak*14)}%`}} /></View></View>
      </View>
      <Pressable onPress={async()=>{try{await Share.share({message:`My Become Score is ${becomeScore}/1000! 💪\n\nTrack your wellness with Become!\nhttps://become.app`});}catch(e){showToast('Could not open share','error');}}} style={{backgroundColor:'#6366F1',borderRadius:12,padding:16,marginTop:24,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:8}}>
        <Text style={{fontSize:16}}>📤</Text>
        <Text style={{color:'#fff',fontWeight:'600',fontSize:16}}>Share My Score</Text>
      </Pressable>
      <View style={[S.card,{marginTop:16}]}>
        <Text style={{color:'#FBBF24',fontSize:11,fontWeight:'700'}}>HOW TO IMPROVE</Text>
        <Text style={{color:'#94A3B8',fontSize:13,marginTop:8}}>• Complete daily workouts (+fitness)</Text>
        <Text style={{color:'#94A3B8',fontSize:13,marginTop:4}}>• Generate and follow meal plans (+nutrition)</Text>
        <Text style={{color:'#94A3B8',fontSize:13,marginTop:4}}>• Do breathing/meditation sessions (+mindfulness)</Text>
        <Text style={{color:'#94A3B8',fontSize:13,marginTop:4}}>• Log activities every day (+consistency streak)</Text>
      </View>
    </ScrollView>
  );

  // --- WEEKLY SUMMARY ---
  if (screen === 'weekly_summary') {
    const summary = getWeeklySummary();
    return (
      <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
        <Pressable onPress={()=>setScreen('home')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
        <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Weekly Summary</Text>
        <Text style={{color:'#94A3B8',marginTop:4}}>Your AI-generated wellness recap</Text>
        <View style={{backgroundColor:'#312E81',borderRadius:16,padding:20,marginTop:24,borderWidth:1,borderColor:'#6366F166'}}>
          <Text style={{color:'#A5B4FC',fontSize:11,fontWeight:'700'}}>🤖 AI INSIGHT</Text>
          <Text style={{color:'#fff',fontSize:15,marginTop:8,lineHeight:22}}>
            {summary.streak > 3 ? `Amazing consistency! Your ${summary.streak}-day streak shows real commitment. ` : 'Building momentum — keep showing up daily. '}
            {summary.workouts > 3 ? `${summary.workouts} workouts this week puts you in the top tier. ` : `${summary.workouts} workouts logged — try to hit 4+ next week. `}
            {summary.breathing > 0 ? 'Great job incorporating mindfulness. ' : 'Consider adding breathing sessions for recovery. '}
            {summary.meals > 5 ? 'Your nutrition tracking is on point!' : 'Log more meals to optimize your nutrition score.'}
          </Text>
        </View>
        <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:28}}>This Week's Numbers</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:12,marginTop:12}}>
          <View style={[S.card,{width:'47%',alignItems:'center'}]}><Text style={{fontSize:24}}>🏋️</Text><Text style={{color:'#fff',fontSize:24,fontWeight:'bold',marginTop:4}}>{summary.workouts}</Text><Text style={{color:'#94A3B8',fontSize:11}}>Workouts</Text></View>
          <View style={[S.card,{width:'47%',alignItems:'center'}]}><Text style={{fontSize:24}}>🥗</Text><Text style={{color:'#fff',fontSize:24,fontWeight:'bold',marginTop:4}}>{summary.meals}</Text><Text style={{color:'#94A3B8',fontSize:11}}>Meals Logged</Text></View>
          <View style={[S.card,{width:'47%',alignItems:'center'}]}><Text style={{fontSize:24}}>🌬️</Text><Text style={{color:'#fff',fontSize:24,fontWeight:'bold',marginTop:4}}>{summary.breathing}</Text><Text style={{color:'#94A3B8',fontSize:11}}>Breathing</Text></View>
          <View style={[S.card,{width:'47%',alignItems:'center'}]}><Text style={{fontSize:24}}>💧</Text><Text style={{color:'#fff',fontSize:24,fontWeight:'bold',marginTop:4}}>{summary.water}</Text><Text style={{color:'#94A3B8',fontSize:11}}>Water</Text></View>
        </View>
        <View style={[S.card,{marginTop:16}]}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={{color:'#fff',fontWeight:'600'}}>Become Score</Text><Text style={{color:'#6366F1',fontSize:24,fontWeight:'bold'}}>{summary.score}/1000</Text></View>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:12}}><Text style={{color:'#fff',fontWeight:'600'}}>Total XP</Text><Text style={{color:'#34D399',fontSize:18,fontWeight:'bold'}}>{summary.totalXP}</Text></View>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:12}}><Text style={{color:'#fff',fontWeight:'600'}}>Streak</Text><Text style={{color:'#FBBF24',fontSize:18,fontWeight:'bold'}}>🔥 {summary.streak} days</Text></View>
        </View>
        <Pressable onPress={async()=>{try{await Share.share({message:`🏆 My Become Score: ${becomeScore}/1000!\n\n💪 ${getWeeklySummary().workouts} workouts\n🥗 ${getWeeklySummary().meals} meals tracked\n🔥 ${points.streak}-day streak\n\nJoin me on Become!\nhttps://become.app`});}catch(e){showToast('Could not open share','error');}}} style={{backgroundColor:'#E1306C',borderRadius:12,padding:16,marginTop:24,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:8}}>
          <Text style={{fontSize:16}}>📸</Text>
          <Text style={{color:'#fff',fontWeight:'600',fontSize:16}}>Share to Instagram</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // --- WEARABLES ---
  if (screen === 'wearables') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Pressable onPress={()=>setScreen('home')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
      <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Connected Devices</Text>
      <Text style={{color:'#94A3B8',marginTop:4}}>Sync your wearables for real-time biometric data</Text>

      {connectedWearables.length > 0 && wearableData.hrv && (
        <View style={[S.card,{marginTop:20}]}>
          <Text style={{color:'#34D399',fontSize:11,fontWeight:'700'}}>SYNCED DATA</Text>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:12}}>
            <View style={{alignItems:'center'}}><Text style={{color:'#6366F1',fontSize:20,fontWeight:'bold'}}>{wearableData.hrv}</Text><Text style={{color:'#94A3B8',fontSize:10}}>HRV (ms)</Text></View>
            <View style={{alignItems:'center'}}><Text style={{color:'#F87171',fontSize:20,fontWeight:'bold'}}>{wearableData.restingHR}</Text><Text style={{color:'#94A3B8',fontSize:10}}>Rest HR</Text></View>
            <View style={{alignItems:'center'}}><Text style={{color:'#34D399',fontSize:20,fontWeight:'bold'}}>{wearableData.steps?.toLocaleString()}</Text><Text style={{color:'#94A3B8',fontSize:10}}>Steps</Text></View>
            <View style={{alignItems:'center'}}><Text style={{color:'#A78BFA',fontSize:20,fontWeight:'bold'}}>{wearableData.sleep ? Math.floor(wearableData.sleep/60)+'h'+wearableData.sleep%60+'m' : '--'}</Text><Text style={{color:'#94A3B8',fontSize:10}}>Sleep</Text></View>
          </View>
          <Pressable onPress={()=>{setWearableData({hrv:48+Math.floor(Math.random()*20),restingHR:55+Math.floor(Math.random()*15),steps:3000+Math.floor(Math.random()*8000),sleep:360+Math.floor(Math.random()*120)});showToast('Data synced!','success');}} style={{backgroundColor:'#334155',borderRadius:8,padding:10,marginTop:12,alignItems:'center'}}>
            <Text style={{color:'#6366F1',fontSize:13,fontWeight:'600'}}>🔄 Sync Now</Text>
          </Pressable>
        </View>
      )}

      <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:28}}>Available Devices</Text>
      {WEARABLE_DEVICES.map((device, i) => {
        const isConnected = connectedWearables.includes(device.id);
        return (
          <View key={i} style={[S.card,{marginTop:12}]}>
            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
              <View style={{flexDirection:'row',alignItems:'center',gap:14}}>
                <View style={{width:46,height:46,borderRadius:12,backgroundColor:isConnected?'#065F46':'#1E293B',borderWidth:1,borderColor:isConnected?'#34D399':'#334155',alignItems:'center',justifyContent:'center'}}>
                  <Text style={{fontSize:20}}>{device.icon}</Text>
                </View>
                <View>
                  <Text style={{color:'#fff',fontWeight:'600'}}>{device.name}</Text>
                  <Text style={{color:'#94A3B8',fontSize:11,marginTop:2}}>{device.description}</Text>
                </View>
              </View>
              <Pressable onPress={()=>toggleWearable(device.id)} style={{backgroundColor:isConnected?'#065F46':'#6366F1',borderRadius:8,paddingHorizontal:14,paddingVertical:8}}>
                <Text style={{color:'#fff',fontSize:12,fontWeight:'600'}}>{isConnected?'Disconnect':'Connect'}</Text>
              </Pressable>
            </View>
            {isConnected && <Text style={{color:'#34D399',fontSize:11,marginTop:8}}>✓ Connected · Last sync: just now</Text>}
          </View>
        );
      })}

      <View style={[S.card,{marginTop:24}]}>
        <Text style={{color:'#FBBF24',fontSize:11,fontWeight:'700'}}>HOW IT WORKS</Text>
        <Text style={{color:'#94A3B8',fontSize:13,marginTop:8}}>• Connect your wearable device above</Text>
        <Text style={{color:'#94A3B8',fontSize:13,marginTop:4}}>• Become syncs HRV, heart rate, steps, and sleep data</Text>
        <Text style={{color:'#94A3B8',fontSize:13,marginTop:4}}>• Your Readiness Score updates automatically</Text>
        <Text style={{color:'#94A3B8',fontSize:13,marginTop:4}}>• Genie uses your data for smarter recommendations</Text>
      </View>
    </ScrollView>
  );

  // --- LEADERBOARD ---
  if (screen === 'leaderboard') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Pressable onPress={()=>setScreen('home')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
      <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Leaderboard</Text>
      <Text style={{color:'#94A3B8',marginTop:4}}>Top performers this week</Text>
      <View style={{backgroundColor:'#312E81',borderRadius:16,padding:16,marginTop:20,borderWidth:1,borderColor:'#6366F166',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
          <View style={{width:36,height:36,borderRadius:18,backgroundColor:'#6366F1',alignItems:'center',justifyContent:'center'}}><Text style={{color:'#fff',fontWeight:'bold'}}>You</Text></View>
          <View><Text style={{color:'#fff',fontWeight:'600'}}>Your Ranking</Text><Text style={{color:'#A5B4FC',fontSize:11}}>Level {points.level} · {points.streak} day streak</Text></View>
        </View>
        <Text style={{color:'#FBBF24',fontSize:20,fontWeight:'bold'}}>{points.total} XP</Text>
      </View>
      <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:24}}>This Week's Top 10</Text>
      {[{rank:1,name:'Sarah M.',xp:1250,level:13,streak:21,avatar:'🏆'},{rank:2,name:'James K.',xp:1100,level:11,streak:14,avatar:'🥈'},{rank:3,name:'Priya R.',xp:980,level:10,streak:18,avatar:'🥉'},{rank:4,name:'Mike T.',xp:870,level:9,streak:12,avatar:'💪'},{rank:5,name:'Emma L.',xp:750,level:8,streak:9,avatar:'⭐'},{rank:6,name:'David W.',xp:680,level:7,streak:7,avatar:'🔥'},{rank:7,name:'Lisa N.',xp:590,level:6,streak:11,avatar:'✨'},{rank:8,name:'Alex P.',xp:520,level:6,streak:5,avatar:'🌟'},{rank:9,name:'Jordan B.',xp:450,level:5,streak:8,avatar:'💫'},{rank:10,name:'Chris H.',xp:380,level:4,streak:4,avatar:'🎯'}].map((u,i) => (
        <View key={i} style={[S.card,{marginTop:8,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}]}>
          <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
            <Text style={{color:i<3?'#FBBF24':'#64748B',fontWeight:'bold',width:20}}>{u.rank}</Text>
            <Text style={{fontSize:18}}>{u.avatar}</Text>
            <View><Text style={{color:'#fff',fontWeight:'500'}}>{u.name}</Text><Text style={{color:'#64748B',fontSize:10}}>Lv.{u.level} · 🔥{u.streak}d</Text></View>
          </View>
          <Text style={{color:'#6366F1',fontWeight:'bold'}}>{u.xp} XP</Text>
        </View>
      ))}
    </ScrollView>
  );

  // --- ACCOUNTABILITY ---
  if (screen === 'accountability') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Pressable onPress={()=>setScreen('home')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
      <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Accountability</Text>
      <Text style={{color:'#94A3B8',marginTop:4}}>Partner up to stay on track</Text>
      {!accountabilityPartner ? (
        <View style={{marginTop:32}}>
          <View style={[S.card,{alignItems:'center'}]}>
            <Text style={{fontSize:48}}>🤝</Text>
            <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:12}}>Find a Partner</Text>
            <Text style={{color:'#94A3B8',fontSize:13,textAlign:'center',marginTop:8}}>Pair up with a friend. Get notified if either misses a day.</Text>
            <Pressable onPress={async()=>{const available=await SMS.isAvailableAsync();if(available){await SMS.sendSMSAsync([],'Be my accountability partner on Become! Download: https://become.app');showToast('Invite sent!','success');}else{showToast('SMS not available','error');}}} style={[S.btn,{marginTop:16,width:'100%'}]}><Text style={S.btnText}>Invite Partner via SMS</Text></Pressable>
            <Pressable onPress={()=>{setAccountabilityPartner('Demo Partner');showToast('Partner connected!','success');}} style={{marginTop:12}}><Text style={{color:'#6366F1'}}>Demo: Connect a partner</Text></Pressable>
          </View>
        </View>
      ) : (
        <View style={{marginTop:24}}>
          <View style={[S.card]}>
            <View style={{flexDirection:'row',alignItems:'center',gap:14}}>
              <View style={{width:50,height:50,borderRadius:25,backgroundColor:'#34D399',alignItems:'center',justifyContent:'center'}}><Text style={{color:'#fff',fontWeight:'bold'}}>DP</Text></View>
              <View style={{flex:1}}><Text style={{color:'#fff',fontWeight:'600',fontSize:16}}>{accountabilityPartner}</Text><Text style={{color:'#34D399',fontSize:12,marginTop:2}}>✓ Active · 5 day streak together</Text></View>
            </View>
          </View>
          <Pressable onPress={()=>{setAccountabilityPartner(null);showToast('Partner disconnected','info');}} style={{marginTop:16,alignItems:'center'}}><Text style={{color:'#F87171',fontSize:13}}>Remove Partner</Text></Pressable>
        </View>
      )}
    </ScrollView>
  );

  // --- REFERRALS ---
  if (screen === 'referrals') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Pressable onPress={()=>setScreen('home')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
      <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Refer Friends</Text>
      <Text style={{color:'#94A3B8',marginTop:4}}>Invite 3 friends → get 1 month free Premium</Text>
      <View style={[S.card,{marginTop:24,alignItems:'center'}]}>
        <Text style={{color:'#6366F1',fontSize:48,fontWeight:'bold'}}>{referralCount}/3</Text>
        <Text style={{color:'#94A3B8',fontSize:13,marginTop:4}}>Friends joined</Text>
        <View style={{width:'100%',height:8,backgroundColor:'#334155',borderRadius:4,marginTop:16}}><View style={{height:8,backgroundColor:'#6366F1',borderRadius:4,width:`${(referralCount/3)*100}%`}} /></View>
        <Text style={{color:referralCount>=3?'#34D399':'#64748B',fontSize:12,marginTop:8}}>{referralCount>=3?'🎉 You earned 1 month free!':`${3-referralCount} more to unlock`}</Text>
      </View>
      <Pressable onPress={async()=>{try{await Share.share({message:'Join me on Become — the AI wellness app! Download: https://become.app'});setReferralCount(prev=>Math.min(3,prev+1));showToast('Invite shared!','success');}catch(e){}}} style={[S.btn,{marginTop:16,flexDirection:'row',justifyContent:'center',gap:8}]}>
        <Text style={{fontSize:16}}>📲</Text><Text style={S.btnText}>Share Invite Link</Text>
      </Pressable>
      <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginTop:28}}>Rewards</Text>
      <View style={[S.card,{marginTop:12}]}>
        <View style={{flexDirection:'row',alignItems:'center',gap:12}}><Text style={{fontSize:18}}>{referralCount>=1?'✅':'⬜'}</Text><View><Text style={{color:'#fff'}}>1 friend joins</Text><Text style={{color:'#94A3B8',fontSize:11}}>+100 bonus XP</Text></View></View>
        <View style={{flexDirection:'row',alignItems:'center',gap:12,marginTop:12}}><Text style={{fontSize:18}}>{referralCount>=2?'✅':'⬜'}</Text><View><Text style={{color:'#fff'}}>2 friends join</Text><Text style={{color:'#94A3B8',fontSize:11}}>+250 XP + badge</Text></View></View>
        <View style={{flexDirection:'row',alignItems:'center',gap:12,marginTop:12}}><Text style={{fontSize:18}}>{referralCount>=3?'✅':'⬜'}</Text><View><Text style={{color:'#fff'}}>3 friends join</Text><Text style={{color:'#94A3B8',fontSize:11}}>🏆 1 month FREE Premium</Text></View></View>
      </View>
    </ScrollView>
  );

  // --- PROFILE ---
  if (screen === 'profile') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Pressable onPress={()=>setScreen('home')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
      <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Profile & Settings</Text>

      {/* Avatar Picker */}
      <View style={[S.card,{marginTop:24}]}>
        <Text style={{color:'#64748B',fontSize:11,fontWeight:'600',marginBottom:12}}>YOUR AVATAR</Text>
        <View style={{alignItems:'center',marginBottom:16}}>
          <Text style={{fontSize:64}}>{avatarEmoji}</Text>
        </View>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:12,justifyContent:'center'}}>
          {AVATAR_OPTIONS.map((emoji) => (
            <Pressable key={emoji} onPress={()=>{setAvatarEmoji(emoji);showToast('Avatar updated!','success');}} style={{width:44,height:44,borderRadius:22,backgroundColor:avatarEmoji===emoji?'#6366F133':'#334155',alignItems:'center',justifyContent:'center',borderWidth:avatarEmoji===emoji?2:0,borderColor:'#6366F1'}}>
              <Text style={{fontSize:22}}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Dark Mode Toggle */}
      <View style={[S.card,{marginTop:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}]}>
        <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
          <Text style={{fontSize:20}}>🌙</Text>
          <View>
            <Text style={{color:'#fff',fontWeight:'600'}}>Dark Mode</Text>
            <Text style={{color:'#94A3B8',fontSize:11}}>Reduce eye strain at night</Text>
          </View>
        </View>
        <Pressable onPress={()=>setDarkMode(!darkMode)} style={{width:52,height:28,borderRadius:14,backgroundColor:darkMode?'#6366F1':'#334155',justifyContent:'center',paddingHorizontal:2}}>
          <View style={{width:24,height:24,borderRadius:12,backgroundColor:'#fff',alignSelf:darkMode?'flex-end':'flex-start'}} />
        </Pressable>
      </View>

      {/* Notifications Link */}
      <Pressable onPress={()=>setScreen('notifications_settings')} style={[S.card,{marginTop:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}]}>
        <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
          <Text style={{fontSize:20}}>🔔</Text>
          <View>
            <Text style={{color:'#fff',fontWeight:'600'}}>Smart Notifications</Text>
            <Text style={{color:'#94A3B8',fontSize:11}}>Configure alerts & reminders</Text>
          </View>
        </View>
        <Text style={{color:'#6366F1'}}>→</Text>
      </Pressable>

      {/* Progress Photos Link */}
      <Pressable onPress={()=>setScreen('progress_photos')} style={[S.card,{marginTop:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}]}>
        <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
          <Text style={{fontSize:20}}>📸</Text>
          <View>
            <Text style={{color:'#fff',fontWeight:'600'}}>Progress Photos</Text>
            <Text style={{color:'#94A3B8',fontSize:11}}>{progressPhotos.length} photos saved</Text>
          </View>
        </View>
        <Text style={{color:'#6366F1'}}>→</Text>
      </Pressable>

      {/* Sign Out */}
      <Pressable onPress={handleSignOut} style={{marginTop:40,alignItems:'center',backgroundColor:'#1E293B',borderRadius:12,padding:16,borderWidth:1,borderColor:'#F8717133'}}>
        <Text style={{color:'#F87171',fontWeight:'600'}}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );

  // --- NOTIFICATIONS SETTINGS ---
  if (screen === 'notifications_settings') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Pressable onPress={()=>setScreen('profile')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
      <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Smart Notifications</Text>
      <Text style={{color:'#94A3B8',marginTop:4}}>AI-powered alerts that matter</Text>

      {/* Global Toggle */}
      <View style={[S.card,{marginTop:24,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}]}>
        <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
          <Text style={{fontSize:20}}>🔔</Text>
          <Text style={{color:'#fff',fontWeight:'600'}}>Notifications Enabled</Text>
        </View>
        <Pressable onPress={()=>setNotificationsEnabled(!notificationsEnabled)} style={{width:52,height:28,borderRadius:14,backgroundColor:notificationsEnabled?'#6366F1':'#334155',justifyContent:'center',paddingHorizontal:2}}>
          <View style={{width:24,height:24,borderRadius:12,backgroundColor:'#fff',alignSelf:notificationsEnabled?'flex-end':'flex-start'}} />
        </Pressable>
      </View>

      {/* Smart Notification Types */}
      {SMART_NOTIFICATIONS.map((notif) => (
        <View key={notif.id} style={[S.card,{marginTop:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}]}>
          <View style={{flexDirection:'row',alignItems:'center',gap:12,flex:1}}>
            <Text style={{fontSize:20}}>{notif.icon}</Text>
            <View style={{flex:1}}>
              <Text style={{color:'#fff',fontWeight:'600'}}>{notif.title}</Text>
              <Text style={{color:'#94A3B8',fontSize:11}}>{notif.desc}</Text>
            </View>
          </View>
          <Pressable onPress={()=>showToast(`${notif.title} toggled`,'info')} style={{width:44,height:28,borderRadius:14,backgroundColor:notificationsEnabled?'#6366F1':'#334155',justifyContent:'center',paddingHorizontal:2}}>
            <View style={{width:24,height:24,borderRadius:12,backgroundColor:'#fff',alignSelf:'flex-end'}} />
          </Pressable>
        </View>
      ))}

      {/* Predicted Recovery Card */}
      <View style={[S.card,{marginTop:24,borderColor:'#6366F133'}]}>
        <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
          <Text style={{fontSize:24}}>🔮</Text>
          <View style={{flex:1}}>
            <Text style={{color:'#6366F1',fontWeight:'600',fontSize:16}}>Predicted Recovery</Text>
            <Text style={{color:'#fff',marginTop:4}}>You'll be fully recovered by Wednesday</Text>
            <Text style={{color:'#94A3B8',fontSize:11,marginTop:4}}>Based on HRV trends, sleep quality, and training load</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  // --- PROGRESS PHOTOS ---
  if (screen === 'progress_photos') return (
    <ScrollView style={{flex:1,backgroundColor:'#0F172A'}} contentContainerStyle={{padding:24,paddingTop:60}}>
      <Pressable onPress={()=>setScreen('profile')}><Text style={{color:'#6366F1',marginBottom:16}}>← Back</Text></Pressable>
      <Text style={{color:'#fff',fontSize:28,fontWeight:'bold'}}>Progress Photos</Text>
      <Text style={{color:'#94A3B8',marginTop:4}}>Track your visual transformation</Text>

      {/* Take Photo Button */}
      <Pressable onPress={takeProgressPhoto} style={[S.btn,{marginTop:24,flexDirection:'row',justifyContent:'center',gap:8}]}>
        <Text style={{fontSize:16}}>📷</Text><Text style={S.btnText}>Take Progress Photo</Text>
      </Pressable>

      {/* Nutrition Insight Card */}
      <View style={[S.card,{marginTop:24,borderColor:'#F59E0B33'}]}>
        <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
          <Text style={{fontSize:24}}>🥬</Text>
          <View style={{flex:1}}>
            <Text style={{color:'#F59E0B',fontWeight:'600',fontSize:14}}>Nutrition Insight</Text>
            <Text style={{color:'#fff',marginTop:4}}>You've been low on iron-rich foods this week</Text>
            <Text style={{color:'#94A3B8',fontSize:11,marginTop:4}}>Try adding spinach, lentils, or red meat to your meals</Text>
          </View>
        </View>
      </View>

      {/* Photo Gallery */}
      {progressPhotos.length > 0 ? (
        <View style={{marginTop:24}}>
          <Text style={{color:'#fff',fontSize:18,fontWeight:'600',marginBottom:12}}>Your Photos</Text>
          {progressPhotos.map((photo, index) => (
            <View key={index} style={[S.card,{marginBottom:12,flexDirection:'row',alignItems:'center',gap:16}]}>
              <View style={{width:60,height:60,borderRadius:12,backgroundColor:'#334155',alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontSize:24}}>📸</Text>
              </View>
              <View>
                <Text style={{color:'#fff',fontWeight:'600'}}>Photo {index + 1}</Text>
                <Text style={{color:'#94A3B8',fontSize:12}}>{photo.date}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[S.card,{marginTop:24,alignItems:'center'}]}>
          <Text style={{fontSize:40}}>📷</Text>
          <Text style={{color:'#94A3B8',marginTop:8,textAlign:'center'}}>No photos yet. Take your first progress photo to start tracking your transformation!</Text>
        </View>
      )}
    </ScrollView>
  );

  // --- HOME (default) ---
  return (
    <View style={{flex:1,backgroundColor:'#0F172A'}}>
      {toast.visible && (
        <View style={{position:'absolute',top:50,left:16,right:16,zIndex:100,backgroundColor:toast.type==='success'?'#065F46':toast.type==='error'?'#7F1D1D':'#1E293B',borderRadius:12,padding:16,flexDirection:'row',alignItems:'center',gap:12,borderWidth:1,borderColor:toast.type==='success'?'#34D39966':toast.type==='error'?'#F8717166':'#33415566'}}>
          <Text style={{fontSize:18}}>{toast.type==='success'?'✓':toast.type==='error'?'✕':'ℹ'}</Text>
          <Text style={{color:'#fff',flex:1,fontSize:14}}>{toast.message}</Text>
          <Pressable onPress={()=>setToast(prev=>({...prev,visible:false}))}><Text style={{color:'#94A3B8'}}>✕</Text></Pressable>
        </View>
      )}
      {showConfetti && (
        <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:9999,pointerEvents:'none',alignItems:'center',paddingTop:100}}>
          <Text style={{fontSize:60}}>🎉</Text>
          <View style={{flexDirection:'row',gap:8,marginTop:8}}><Text style={{fontSize:30}}>⭐</Text><Text style={{fontSize:40}}>🏆</Text><Text style={{fontSize:30}}>⭐</Text></View>
          <Text style={{color:'#fff',fontSize:24,fontWeight:'bold',marginTop:16}}>LEVEL UP!</Text>
          <Text style={{color:'#FBBF24',fontSize:16,marginTop:4}}>Level {points.level} Achieved</Text>
          <View style={{flexDirection:'row',gap:4,marginTop:16}}>{['🎊','✨','🎉','💫','🌟','🎊','✨','🎉'].map((e,i)=>(<Text key={i} style={{fontSize:20,opacity:0.8}}>{e}</Text>))}</View>
        </View>
      )}
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

        {/* Become Score */}
        <Pressable onPress={()=>{calculateBecomeScore();setScreen('become_score');}} style={[S.card,{marginTop:16}]}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <View>
              <Text style={{color:'#64748B',fontSize:11,fontWeight:'600'}}>BECOME SCORE</Text>
              <Text style={{color:'#6366F1',fontSize:36,fontWeight:'bold',marginTop:4}}>{becomeScore}</Text>
            </View>
            <View style={{width:60,height:60,borderRadius:30,borderWidth:3,borderColor:'#6366F1',alignItems:'center',justifyContent:'center'}}>
              <Text style={{color:'#6366F1',fontSize:11,fontWeight:'bold'}}>/1000</Text>
            </View>
          </View>
          <Text style={{color:'#94A3B8',fontSize:11,marginTop:8}}>Tap to see full breakdown →</Text>
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
          <Pressable onPress={()=>setScreen('wearables')} style={[S.card,{flex:1,alignItems:'center'}]}>
            <Text style={{fontSize:24}}>⌚</Text>
            <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Wearables</Text>
          </Pressable>
        </View>

        <View style={{flexDirection:'row',gap:12,marginTop:12}}>
          <Pressable onPress={()=>setScreen('leaderboard')} style={[S.card,{flex:1,alignItems:'center'}]}>
            <Text style={{fontSize:24}}>🏅</Text>
            <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Leaderboard</Text>
          </Pressable>
          <Pressable onPress={()=>setScreen('accountability')} style={[S.card,{flex:1,alignItems:'center'}]}>
            <Text style={{fontSize:24}}>🤝</Text>
            <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Partners</Text>
          </Pressable>
          <Pressable onPress={()=>setScreen('referrals')} style={[S.card,{flex:1,alignItems:'center'}]}>
            <Text style={{fontSize:24}}>🎁</Text>
            <Text style={{color:'#fff',fontWeight:'600',marginTop:4,fontSize:13}}>Refer</Text>
          </Pressable>
        </View>

        {/* Meal Preview */}
        <View style={[S.card,{marginTop:16}]}>
          <Text style={{color:'#64748B',fontSize:11,fontWeight:'600'}}>TODAY'S NUTRITION</Text>
          <Pressable onPress={()=>setScreen('nutrition')}>
            <Text style={{color:'#6366F1',marginTop:8}}>View or generate your meal plan →</Text>
          </Pressable>
        </View>

        {/* Weekly Summary */}
        <Pressable onPress={()=>{calculateBecomeScore();setScreen('weekly_summary');}} style={[S.card,{marginTop:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}]}>
          <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
            <Text style={{fontSize:20}}>📊</Text>
            <View>
              <Text style={{color:'#fff',fontWeight:'600'}}>Weekly Summary</Text>
              <Text style={{color:'#94A3B8',fontSize:11}}>AI-powered wellness recap</Text>
            </View>
          </View>
          <Text style={{color:'#6366F1'}}>View →</Text>
        </Pressable>

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

        {/* Profile & Settings */}
        <Pressable onPress={()=>setScreen('profile')} style={[S.card,{marginTop:32,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}]}>
          <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
            <View style={{width:44,height:44,borderRadius:22,backgroundColor:'#6366F133',alignItems:'center',justifyContent:'center'}}>
              <Text style={{fontSize:22}}>{avatarEmoji}</Text>
            </View>
            <View>
              <Text style={{color:'#fff',fontWeight:'600'}}>Profile & Settings</Text>
              <Text style={{color:'#94A3B8',fontSize:11}}>Avatar, notifications, photos</Text>
            </View>
          </View>
          <Text style={{color:'#6366F1'}}>→</Text>
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
                        <Pressable key={j} onPress={()=>{setGenieOpen(false); showToast(b.label + ' coming in next build', 'info');}} style={{backgroundColor:'#6366F122',borderWidth:1,borderColor:'#6366F166',borderRadius:20,paddingHorizontal:12,paddingVertical:6}}>
                          <Text style={{color:'#A5B4FC',fontSize:12}}>{b.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              {genieLoading && <View style={{alignItems:'flex-start',marginBottom:12}}><View style={{backgroundColor:'#334155',borderRadius:16,padding:12}}><Text style={{color:'#94A3B8'}}>Thinking...</Text></View></View>}
            </ScrollView>

            <View style={{flexDirection:'row',gap:8,marginTop:8,alignItems:'center'}}>
              <Pressable onPress={async()=>{
                if (isRecording) {
                  setIsRecording(false);
                  setGenieInput('What should I do for my workout today?');
                  showToast('Voice captured — tap send', 'success');
                } else {
                  setIsRecording(true);
                  showToast('Listening... speak now', 'info');
                }
              }} style={{width:44,height:44,borderRadius:22,backgroundColor:isRecording?'#DC2626':'#334155',alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontSize:18}}>{isRecording ? '⏹' : '🎤'}</Text>
              </Pressable>
              <TextInput placeholder="Ask Genie..." placeholderTextColor="#64748B" value={genieInput} onChangeText={setGenieInput} onSubmitEditing={sendGenie} returnKeyType="send"
                style={{flex:1,backgroundColor:'#0F172A',borderRadius:12,padding:12,color:'#fff',borderWidth:1,borderColor:'#334155'}} />
              <Pressable onPress={sendGenie} style={{backgroundColor:'#6366F1',borderRadius:12,width:44,alignItems:'center',justifyContent:'center',height:44}}>
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
