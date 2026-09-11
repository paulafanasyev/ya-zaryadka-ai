import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Speech from 'expo-speech';
import NetInfo from '@react-native-community/netinfo';
import { NavigationParams } from '../../types';
import { aiProvider, AIMessage, chatService } from '../../services/api';
import { Svg, Circle, Rect, Line, Path } from 'react-native-svg';

type Props = { navigation: StackNavigationProp<NavigationParams, 'Svetlana'> };

type ChatMessage = AIMessage & { fromUser: boolean; sentAt: string; id: number; conversationId: number };

type PikoState = 'idle' | 'thinking' | 'speaking' | 'happy' | 'error';

const PikoAvatar = ({ state }: { state: PikoState }) => {
  const talking = state === 'speaking';
  const happy = state === 'happy';
  return (
    <View style={[styles.avatarWrap, talking && styles.avatarSpeaking, happy && styles.avatarHappy]}>
      <Svg width={170} height={170} viewBox="0 0 170 170">
        <Rect x="28" y="42" width="114" height="92" rx="28" fill="#B8F2C8" stroke="#26734D" strokeWidth="4" />
        <Rect x="45" y="22" width="80" height="30" rx="15" fill="#DFFBE7" stroke="#26734D" strokeWidth="4" />
        <Line x1="85" y1="22" x2="85" y2="8" stroke="#26734D" strokeWidth="4" />
        <Circle cx="85" cy="7" r="5" fill="#26734D" />
        <Circle cx="62" cy="80" r="14" fill="#FFFFFF" stroke="#26734D" strokeWidth="3" />
        <Circle cx="108" cy="80" r="14" fill="#FFFFFF" stroke="#26734D" strokeWidth="3" />
        <Circle cx="62" cy="80" r="6" fill="#26734D" />
        <Circle cx="108" cy="80" r="6" fill="#26734D" />
        {talking ? (
          <Rect x="68" y="103" width="34" height="13" rx="6" fill="#26734D" />
        ) : (
          <Path d={happy ? 'M68 103 Q85 122 102 103' : 'M70 108 Q85 116 100 108'} stroke="#26734D" strokeWidth="4" fill="none" />
        )}
        <Line x1="28" y1="78" x2="12" y2="68" stroke="#26734D" strokeWidth="5" />
        <Line x1="142" y1="78" x2="158" y2="68" stroke="#26734D" strokeWidth="5" />
      </Svg>
    </View>
  );
};

const initialMessage: ChatMessage = {
  id: 0,
  conversationId: 0,
  fromUser: false,
  content: 'Привет! Я Пико. Я помогу тебе с зарядкой, полезными привычками, учёбой и творчеством. Что будем делать?',
  sentAt: new Date().toISOString(),
  role: 'assistant',
};

export default function SvetlanaScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pikoState, setPikoState] = useState<PikoState>('idle');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => setIsOnline(state.isConnected ?? false));
    return unsubscribe;
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  useEffect(() => () => Speech.stop(), []);

  const speak = (text: string, happy = false) => {
    Speech.stop();
    setPikoState(happy ? 'happy' : 'speaking');
    Speech.speak(text, {
      language: 'ru-RU',
      pitch: 1.08,
      rate: 0.94,
      onDone: () => setPikoState(happy ? 'happy' : 'idle'),
      onStopped: () => setPikoState('idle'),
      onError: () => setPikoState('error'),
    });
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      conversationId: 1,
      fromUser: true,
      content: text,
      sentAt: new Date().toISOString(),
      role: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setPikoState('thinking');

    try {
      const response = await chatService.sendMessage(text, 1);
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        conversationId: response.conversationId || 1,
        fromUser: false,
        content: response.content,
        sentAt: response.sentAt,
        role: 'assistant',
      };
      setMessages((prev) => [...prev, aiMessage]);
      const isWorkoutPraise = /зарядк|упражнен|молодец|отлично|справил/i.test(text + ' ' + response.content);
      speak(response.content, isWorkoutPraise);
    } catch (error) {
      setPikoState('error');
      const fallback: ChatMessage = {
        id: Date.now() + 1,
        conversationId: 1,
        fromUser: false,
        content: 'Сейчас я не могу связаться с сервером. Но можем продолжить позже. Если хочешь зарядиться прямо сейчас — начни с лёгкой разминки без боли.',
        sentAt: new Date().toISOString(),
        role: 'assistant',
      };
      setMessages((prev) => [...prev, fallback]);
      speak(fallback.content);
    } finally {
      setIsLoading(false);
    }
  };

  const quickAsk = (text: string) => {
    setInputText(text);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Пико</Text>
            <Text style={styles.status}>{isOnline ? 'Онлайн-помощник' : 'Офлайн-режим'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.avatarPanel}>
          <PikoAvatar state={pikoState} />
          <Text style={styles.stateText}>
            {pikoState === 'thinking' ? 'Думаю…' : pikoState === 'speaking' ? 'Говорю…' : pikoState === 'happy' ? 'Ура!' : pikoState === 'error' ? 'Есть проблема со связью' : 'Готов помочь'}
          </Text>
        </View>

        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quick} onPress={() => quickAsk('Давай сделаем зарядку')}><Text style={styles.quickText}>Зарядка</Text></TouchableOpacity>
          <TouchableOpacity style={styles.quick} onPress={() => quickAsk('Расскажи сказку Пушкина')}><Text style={styles.quickText}>Пушкин</Text></TouchableOpacity>
          <TouchableOpacity style={styles.quick} onPress={() => quickAsk('Научи меня копить деньги')}><Text style={styles.quickText}>Деньги</Text></TouchableOpacity>
        </View>

        <ScrollView ref={scrollViewRef} style={styles.messages} contentContainerStyle={styles.messagesContent}>
          {messages.map((message) => (
            <View key={message.id} style={[styles.bubble, message.fromUser ? styles.userBubble : styles.pikoBubble]}>
              <Text style={styles.bubbleText}>{message.content}</Text>
            </View>
          ))}
          {isLoading && <View style={[styles.bubble, styles.pikoBubble]}><ActivityIndicator /></View>}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Напиши Пико…"
            placeholderTextColor="#72917E"
            style={styles.input}
            multiline
            maxLength={1000}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity onPress={sendMessage} disabled={!inputText.trim() || isLoading} style={[styles.send, (!inputText.trim() || isLoading) && styles.sendDisabled]}>
            <Text style={styles.sendText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5FFF8' },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 6 },
  title: { fontSize: 28, fontWeight: '800', color: '#174B32' },
  status: { fontSize: 12, color: '#5B8069', marginTop: 2 },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DFFBE7', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 28, lineHeight: 30, color: '#174B32' },
  avatarPanel: { alignItems: 'center', paddingVertical: 2 },
  avatarWrap: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center' },
  avatarSpeaking: { transform: [{ scale: 1.04 }] },
  avatarHappy: { transform: [{ scale: 1.07 }] },
  stateText: { color: '#26734D', fontWeight: '700', marginBottom: 4 },
  quickRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 7, marginBottom: 4 },
  quick: { flex: 1, backgroundColor: '#E1F8E8', borderRadius: 16, paddingVertical: 9, alignItems: 'center' },
  quickText: { color: '#26734D', fontWeight: '700', fontSize: 12 },
  messages: { flex: 1, paddingHorizontal: 12 },
  messagesContent: { paddingVertical: 8 },
  bubble: { maxWidth: '86%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, marginVertical: 4 },
  pikoBubble: { alignSelf: 'flex-start', backgroundColor: '#E5F8EB', borderBottomLeftRadius: 5 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#B8F2C8', borderBottomRightRadius: 5 },
  bubbleText: { color: '#173A29', fontSize: 15, lineHeight: 21 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, gap: 8, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#D8EEE0' },
  input: { flex: 1, minHeight: 44, maxHeight: 110, backgroundColor: '#F1FAF4', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#173A29' },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#26734D', alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: '#FFFFFF', fontSize: 25, fontWeight: '800' },
});
