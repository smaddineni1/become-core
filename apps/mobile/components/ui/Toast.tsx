import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps { message: string; type: ToastType; visible: boolean; duration?: number; onHide?: () => void; }

export function Toast({ message, type, visible, duration = 3000, onHide }: ToastProps) {
  const [show, setShow] = useState(visible);
  useEffect(() => {
    if (visible) { setShow(true); const t = setTimeout(() => { setShow(false); onHide?.(); }, duration); return () => clearTimeout(t); }
    setShow(false);
  }, [visible, duration, onHide]);

  if (!show) return null;
  const bg = type === 'success' ? 'bg-emerald-900/90 border-emerald-600' : type === 'error' ? 'bg-red-900/90 border-red-600' : 'bg-indigo-900/90 border-indigo-600';
  const textColor = type === 'success' ? 'text-emerald-200' : type === 'error' ? 'text-red-200' : 'text-indigo-200';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  return (
    <View className="absolute top-16 left-4 right-4 z-50">
      <View className={`${bg} border rounded-xl px-4 py-3 flex-row items-center gap-3`}>
        <Text className={`${textColor} font-bold text-base`}>{icon}</Text>
        <Text className={`${textColor} text-sm font-medium flex-1`}>{message}</Text>
      </View>
    </View>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({ message: '', type: 'info', visible: false });
  const show = (message: string, type: ToastType = 'info') => setToast({ message, type, visible: true });
  const hide = () => setToast((p) => ({ ...p, visible: false }));
  return { toast, show, hide };
}
