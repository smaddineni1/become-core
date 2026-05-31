/**
 * GenieChatSheet — Bottom sheet chat UI for the Genie AI Coach
 *
 * Opens from the persistent FAB on all screens.
 * Features:
 * - Scrollable message history
 * - Streaming-style typing indicator
 * - Tappable action button chips below assistant messages
 * - Elegant animated entry/exit
 */

import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useState, useRef, useCallback } from 'react';
import type { ActionButton, GenieMessage } from '../../src/packages/shared';
import { sendGenieMessage } from '../../lib/api/genie';

interface GenieChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GenieChatSheet({ isOpen, onClose }: GenieChatSheetProps) {
  const [messages, setMessages] = useState<GenieMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: GenieMessage = {
      id: `temp_${Date.now()}`,
      conversationId: conversationId ?? '',
      role: 'user',
      content: input.trim(),
      actionButtons: [],
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const result = await sendGenieMessage(userMessage.content, conversationId);

    if (result.success && result.response) {
      if (result.conversationId) {
        setConversationId(result.conversationId);
      }

      const assistantMessage: GenieMessage = {
        id: `resp_${Date.now()}`,
        conversationId: result.conversationId ?? '',
        role: 'assistant',
        content: result.response.text,
        actionButtons: result.response.action_buttons,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      // Error fallback message
      const errorMessage: GenieMessage = {
        id: `err_${Date.now()}`,
        conversationId: conversationId ?? '',
        role: 'assistant',
        content: "I'm having trouble connecting right now. Try again in a moment!",
        actionButtons: [
          { label: 'Start a Workout', route: '/(tabs)/form-check', icon: 'dumbbell' },
        ],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [input, isLoading, conversationId]);

  const handleActionButton = (button: ActionButton) => {
    onClose();
    // Navigate to the route specified by the action button
    router.push(button.route as any);
  };

  if (!isOpen) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="absolute inset-0 z-50"
    >
      {/* Backdrop */}
      <Pressable
        className="absolute inset-0 bg-black/60"
        onPress={onClose}
      />

      {/* Chat Sheet */}
      <View className="absolute bottom-0 left-0 right-0 h-[70%] bg-slate-900 rounded-t-3xl border-t border-slate-700 overflow-hidden">
        {/* Handle */}
        <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1 rounded-full bg-slate-600" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-slate-800">
          <View className="flex-row items-center gap-3">
            <Text className="text-2xl">🧞</Text>
            <View>
              <Text className="text-white font-semibold text-lg">Genie</Text>
              <Text className="text-slate-400 text-xs">Your AI wellness coach</Text>
            </View>
          </View>
          <Pressable
            className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center"
            onPress={onClose}
          >
            <Text className="text-slate-400 font-bold">✕</Text>
          </Pressable>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 py-3"
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-4xl mb-4">🧞</Text>
              <Text className="text-white text-lg font-semibold text-center">
                Hey! I'm Genie.
              </Text>
              <Text className="text-slate-400 text-sm text-center mt-2 max-w-[250px]">
                Ask me anything about your fitness, nutrition, or wellness journey.
              </Text>
              {/* Quick suggestions */}
              <View className="flex-row flex-wrap justify-center gap-2 mt-6">
                {['I\'m tired today', 'What should I eat?', 'Help me stretch'].map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    className="bg-slate-800 rounded-full px-4 py-2 border border-slate-700"
                    onPress={() => {
                      setInput(suggestion);
                    }}
                  >
                    <Text className="text-slate-300 text-xs">{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {messages.map((msg) => (
            <View
              key={msg.id}
              className={`mb-4 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Message Bubble */}
              <View
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 rounded-br-md'
                    : 'bg-slate-800 rounded-bl-md border border-slate-700'
                }`}
              >
                <Text
                  className={`text-sm leading-5 ${
                    msg.role === 'user' ? 'text-white' : 'text-slate-200'
                  }`}
                >
                  {msg.content}
                </Text>
              </View>

              {/* Action Buttons (assistant only) */}
              {msg.role === 'assistant' && msg.actionButtons.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-2 max-w-[85%]">
                  {msg.actionButtons.map((btn, idx) => (
                    <Pressable
                      key={idx}
                      className="bg-indigo-600/20 border border-indigo-500/50 rounded-full px-4 py-2 flex-row items-center gap-2 active:bg-indigo-600/40"
                      onPress={() => handleActionButton(btn)}
                    >
                      {btn.icon && <Text className="text-sm">{getIconEmoji(btn.icon)}</Text>}
                      <Text className="text-indigo-300 text-xs font-medium">
                        {btn.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <View className="items-start mb-4">
              <View className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-700">
                <View className="flex-row gap-1.5">
                  <View className="w-2 h-2 rounded-full bg-slate-500" />
                  <View className="w-2 h-2 rounded-full bg-slate-500" />
                  <View className="w-2 h-2 rounded-full bg-slate-500" />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View className="px-4 pb-6 pt-2 border-t border-slate-800 bg-slate-900">
          <View className="flex-row items-center gap-3">
            <TextInput
              className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-white border border-slate-700"
              placeholder="Ask Genie anything..."
              placeholderTextColor="#64748B"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              editable={!isLoading}
            />
            <Pressable
              className={`w-11 h-11 rounded-full items-center justify-center ${
                input.trim() && !isLoading ? 'bg-indigo-600 active:bg-indigo-700' : 'bg-slate-800'
              }`}
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Text className="text-white text-lg">↑</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function getIconEmoji(icon: string): string {
  const map: Record<string, string> = {
    dumbbell: '🏋️',
    meditation: '🧘',
    salad: '🥗',
    heart: '❤️',
    lightning: '⚡',
    moon: '🌙',
  };
  return map[icon] ?? '✨';
}
