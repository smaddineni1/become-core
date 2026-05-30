import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, type ViewStyle } from 'react-native';

type AnimationType = 'fadeIn' | 'slideUp' | 'slideRight' | 'scale';

interface AnimatedTransitionProps { children: ReactNode; type?: AnimationType; delay?: number; duration?: number; style?: ViewStyle; }

export function AnimatedTransition({ children, type = 'fadeIn', delay = 0, duration = 300, style }: AnimatedTransitionProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(type === 'slideUp' ? 20 : 0)).current;
  const scaleVal = useRef(new Animated.Value(type === 'scale' ? 0.95 : 1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration, delay, useNativeDriver: true }),
      Animated.timing(scaleVal, { toValue: 1, duration, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }, { scale: scaleVal }] }, style]}>
      {children}
    </Animated.View>
  );
}

export function StaggeredList({ children, staggerDelay = 80, type = 'slideUp' }: { children: ReactNode[]; staggerDelay?: number; type?: AnimationType }) {
  return <>{children.map((child, i) => <AnimatedTransition key={i} type={type} delay={i * staggerDelay}>{child}</AnimatedTransition>)}</>;
}
