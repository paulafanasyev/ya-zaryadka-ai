import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParams, Message } from '../../types';
import { chatService, aiProvider, AIMessage } from '../../services/api';
import NetInfo from '@react-native-community/netinfo';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Svg, Circle, Rect, Path, Ellipse, G, Line } from 'react-native-svg';

type SvetlanaScreenProps = {
  navigation: StackNavigationProp<NavigationParams, 'Svetlana'>;
};

type TrainerId = 'wall-e' | 'anya' | 'max' | 'masha' | 'bear';

interface Trainer {
  id: TrainerId;
  name: string;
  description: string;
  voiceParams: {
    pitch: number;
    rate: number;
    language: 'ru-RU' | 'en-US';
  };
  color: string;
  renderAvatar: (size: number) => JSX.Element;
}

// Компонент отрисовки аватара в стиле Pixar/Disney
const AvatarSVG: React.FC<{ type: TrainerId; size: number }> = ({ type, size }) => {
  switch (type) {
    case 'wall-e':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Корпус */}
          <Rect x="20" y="30" width="60" height="50" rx="10" fill="#F4D03F" stroke="#B7950B" strokeWidth="2" />
          {/* Глаза-бинокли */}
          <G x="50" y="45">
            <Circle cx="-12" cy="0" r="10" fill="#85C1E9" stroke="#2E86C1" strokeWidth="2" />
            <Circle cx="12" cy="0" r="10" fill="#85C1E9" stroke="#2E86C1" strokeWidth="2" />
            <Rect x="-25" y="-5" width="50" height="12" fill="#555" rx="2" />
            <Circle cx="-12" cy="0" r="3" fill="#FFF" />
            <Circle cx="12" cy="0" r="3" fill="#FFF" />
          </G>
          {/* Рот */}
          <Rect x="35" y="65" width="30" height="4" fill="#555" rx="2" />
          {/* Антенны */}
          <Line x1="25" y1="30" x2="15" y2="10" stroke="#B7950B" strokeWidth="3" />
          <Line x1="75" y1="30" x2="85" y2="10" stroke="#B7950B" strokeWidth="3" />
          <Circle cx="15" cy="10" r="3" fill="#E74C3C" />
          <Circle cx="85" cy="10" r="3" fill="#E74C3C" />
        </Svg>
      );
    case 'anya':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Волосы */}
          <Ellipse cx="50" cy="45" rx="35" ry="40" fill="#F1C40F" />
          <Path d="M15 45 Q10 70 20 85 M85 45 Q90 70 80 85" stroke="#F1C40F" strokeWidth="25" fill="none" />
          {/* Лицо */}
          <Ellipse cx="50" cy="50" rx="25" ry="30" fill="#FFE0BD" />
          {/* Глаза */}
          <Circle cx="40" cy="45" r="4" fill="#333" />
          <Circle cx="60" cy="45" r="4" fill="#333" />
          <Circle cx="41" cy="44" r="1.5" fill="#FFF" />
          <Circle cx="61" cy="44" r="1.5" fill="#FFF" />
          {/* Рот */}
          <Path d="M40 60 Q50 68 60 60" stroke="#D35400" strokeWidth="2" fill="none" />
          {/* Кофточка */}
          <Path d="M25 80 Q50 95 75 80 L75 100 L25 100 Z" fill="#FF9FF3" />
        </Svg>
      );
    case 'max':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Волосы */}
          <Path d="M20 40 Q30 20 50 25 Q70 20 80 40 Q85 50 80 60 L20 60 Q15 50 20 40" fill="#2C3E50" />
          {/* Лицо */}
          <Ellipse cx="50" cy="55" rx="28" ry="32" fill="#FFD1AA" />
          {/* Глаза */}
          <Circle cx="40" cy="50" r="4" fill="#333" />
          <Circle cx="60" cy="50" r="4" fill="#333" />
          <Circle cx="41" cy="49" r="1.5" fill="#FFF" />
          <Circle cx="61" cy="49" r="1.5" fill="#FFF" />
          {/* Брови */}
          <Line x1="35" y1="42" x2="45" y2="44" stroke="#2C3E50" strokeWidth="2" />
          <Line x1="55" y1="44" x2="65" y2="42" stroke="#2C3E50" strokeWidth="2" />
          {/* Рот */}
          <Path d="M40 70 Q50 75 60 70" stroke="#A04000" strokeWidth="2" fill="none" />
          {/* Футболка */}
          <Path d="M25 85 Q50 100 75 85 L75 100 L25 100 Z" fill="#3498DB" />
        </Svg>
      );
    case 'masha':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Платок (розовый с узором) */}
          <Path d="M10 40 Q50 10 90 40 Q95 60 85 80 L15 80 Q5 60 10 40" fill="#FF69B4" stroke="#C71585" strokeWidth="2" />
          <Circle cx="30" cy="50" r="3" fill="#FFD700" />
          <Circle cx="70" cy="50" r="3" fill="#FFD700" />
          <Circle cx="50" cy="35" r="4" fill="#FFD700" />
          {/* Лицо */}
          <Ellipse cx="50" cy="55" rx="22" ry="26" fill="#FFE0BD" />
          {/* Глаза */}
          <Circle cx="42" cy="50" r="5" fill="#333" />
          <Circle cx="58" cy="50" r="5" fill="#333" />
          <Circle cx="44" cy="48" r="2" fill="#FFF" />
          <Circle cx="60" cy="48" r="2" fill="#FFF" />
          {/* Рот */}
          <Circle cx="50" cy="65" r="4" fill="#D35400" opacity="0.6" />
          {/* Веснушки */}
          <Circle cx="35" cy="60" r="1" fill="#D35400" />
          <Circle cx="40" cy="62" r="1" fill="#D35400" />
          <Circle cx="60" cy="62" r="1" fill="#D35400" />
          <Circle cx="65" cy="60" r="1" fill="#D35400" />
        </Svg>
      );
    case 'bear':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Уши */}
          <Circle cx="25" cy="30" r="12" fill="#5D4037" />
          <Circle cx="75" cy="30" r="12" fill="#5D4037" />
          <Circle cx="25" cy="30" r="6" fill="#8D6E63" />
          <Circle cx="75" cy="30" r="6" fill="#8D6E63" />
          {/* Голова */}
          <Ellipse cx="50" cy="50" rx="35" ry="30" fill="#5D4037" />
          {/* Мордочка */}
          <Ellipse cx="50" cy="55" rx="20" ry="16" fill="#D7CCC8" />
          <Ellipse cx="50" cy="48" rx="12" ry="8" fill="#8D6E63" />
          {/* Нос */}
          <Ellipse cx="50" cy="45" rx="6" ry="4" fill="#3E2723" />
          {/* Глаза */}
          <Circle cx="35" cy="40" r="4" fill="#333" />
          <Circle cx="65" cy="40" r="4" fill="#333" />
          <Circle cx="37" cy="38" r="1.5" fill="#FFF" />
          <Circle cx="67" cy="38" r="1.5" fill="#FFF" />
          {/* Рот */}
          <Path d="M45 60 Q50 65 55 60" stroke="#3E2723" strokeWidth="2" fill="none" />
        </Svg>
      );
    default:
      return <Circle cx="50" cy="50" r="40" fill="#ccc" />;
  }
};

const trainers: Trainer[] = [
  {
    id: 'wall-e',
    name: 'Валли',
    description: 'Добрый робот-помощник. Любит порядок и технологии.',
    voiceParams: { pitch: 0.8, rate: 0.9, language: 'ru-RU' },
    color: '#F4D03F',
    renderAvatar: (size) => <AvatarSVG type="wall-e" size={size} />,
  },
  {
    id: 'anya',
    name: 'Аня',
    description: 'Активная и весёлая девочка. Любит танцы и йогу.',
    voiceParams: { pitch: 1.2, rate: 1.0, language: 'ru-RU' },
    color: '#FF9FF3',
    renderAvatar: (size) => <AvatarSVG type="anya" size={size} />,
  },
  {
    id: 'max',
    name: 'Макс',
    description: 'Спортивный мальчик. Поможет стать сильным и выносливым.',
    voiceParams: { pitch: 0.9, rate: 1.0, language: 'ru-RU' },
    color: '#3498DB',
    renderAvatar: (size) => <AvatarSVG type="max" size={size} />,
  },
  {
    id: 'masha',
    name: 'Маша',
    description: 'Озорная и энергичная. Зарядка с ней пролетит незаметно!',
    voiceParams: { pitch: 1.4, rate: 1.1, language: 'ru-RU' },
    color: '#FF69B4',
    renderAvatar: (size) => <AvatarSVG type="masha" size={size} />,
  },
  {
    id: 'bear',
    name: 'Миша',
    description: 'Мудрый и спокойный тренер. Научит делать всё правильно.',
    voiceParams: { pitch: 0.6, rate: 0.85, language: 'ru-RU' },
    color: '#5D4037',
    renderAvatar: (size) => <AvatarSVG type="bear" size={size} />,
  },
];

export default function SvetlanaScreen({ navigation }: SvetlanaScreenProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 0,
      conversationId: 0,
      fromUser: false,
      content: 'Привет! Выбери своего тренера!',
      sentAt: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadSelectedTrainer();
  }, []);

  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const loadSelectedTrainer = async () => {
    try {
      const savedTrainerId = await AsyncStorage.getItem('selectedTrainer');
      if (savedTrainerId) {
        const trainer = trainers.find((t) => t.id === savedTrainerId);
        if (trainer) {
          setSelectedTrainer(trainer);
          setMessages([
            {
              id: 0,
              conversationId: 0,
              fromUser: false,
              content: `Привет! Я ${trainer.name}, твой помощник! Как дела? Готов сделать зарядку сегодня?`,
              sentAt: new Date().toISOString(),
            },
          ]);
        } else {
          setShowTrainerModal(true);
        }
      } else {
        setShowTrainerModal(true);
      }
    } catch (error) {
      console.error('Ошибка загрузки тренера:', error);
      setShowTrainerModal(true);
    }
  };

  const selectTrainer = async (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setShowTrainerModal(false);
    try {
      await AsyncStorage.setItem('selectedTrainer', trainer.id);
      setMessages([
        {
          id: 0,
          conversationId: 0,
          fromUser: false,
          content: `Привет! Я ${trainer.name}, твой помощник! Как дела? Готов сделать зарядку сегодня?`,
          sentAt: new Date().toISOString(),
        },
      ]);
      speak(`Привет! Я ${trainer.name}`);
    } catch (error) {
      console.error('Ошибка сохранения тренера:', error);
    }
  };

  const speak = (text: string) => {
    if (!selectedTrainer) return;
    
    Speech.stop();
    Speech.speak(text, {
      language: selectedTrainer.voiceParams.language,
      pitch: selectedTrainer.voiceParams.pitch,
      rate: selectedTrainer.voiceParams.rate,
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedTrainer) return;

    const userMessage: AIMessage = {
      id: messages.length,
      conversationId: messages.length > 0 ? messages[messages.length - 1].conversationId : 1,
      fromUser: true,
      content: inputText.trim(),
      sentAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage.content);
      const aiMessage: AIMessage = {
        id: messages.length + 1,
        conversationId: userMessage.conversationId,
        fromUser: false,
        content: response,
        sentAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      speak(response);
    } catch (error) {
      const errorMessage: AIMessage = {
        id: messages.length + 1,
        conversationId: userMessage.conversationId,
        fromUser: false,
        content: 'Извини, я сейчас офлайн. Но я всё равно тебя слышу! 📡',
        sentAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTrainerItem = ({ item }: { item: Trainer }) => (
    <TouchableOpacity
      style={[styles.trainerCard, { backgroundColor: item.color }]}
      onPress={() => selectTrainer(item)}
    >
      <View style={styles.trainerAvatarContainer}>
        {item.renderAvatar(80)}
      </View>
      <Text style={styles.trainerName}>{item.name}</Text>
      <Text style={styles.trainerDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Заголовок с аватаром выбранного тренера */}
        <View style={styles.header}>
          {selectedTrainer && (
            <View style={styles.selectedTrainerContainer}>
              {selectedTrainer.renderAvatar(50)}
              <Text style={styles.headerTitle}>{selectedTrainer.name}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.changeTrainerButton}
            onPress={() => setShowTrainerModal(true)}
          >
            <Text style={styles.changeTrainerText}>Выбрать другого</Text>
          </TouchableOpacity>
        </View>

        {/* Сообщения чата */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.fromUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {!message.fromUser && selectedTrainer && (
                <View style={styles.avatarInMessage}>
                  {selectedTrainer.renderAvatar(30)}
                </View>
              )}
              <Text
                style={[
                  styles.messageText,
                  message.fromUser ? styles.userText : styles.aiText,
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))}
          {isLoading && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <ActivityIndicator size="small" color="#666" />
            </View>
          )}
        </ScrollView>

        {/* Поле ввода */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Напиши сообщение..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Модальное окно выбора тренера */}
      <Modal
        visible={showTrainerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !selectedTrainer && setShowTrainerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выбери своего тренера!</Text>
            <FlatList
              data={trainers}
              renderItem={renderTrainerItem}
              keyExtractor={(item) => item.id}
              numColumns={1}
              contentContainerStyle={styles.trainersList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedTrainerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  changeTrainerButton: {
    padding: 8,
  },
  changeTrainerText: {
    color: '#007AFF',
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
  },
  avatarInMessage: {
    marginRight: 8,
  },
  messageText: {
    fontSize: 16,
    flex: 1,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  trainersList: {
    paddingBottom: 20,
  },
  trainerCard: {
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trainerAvatarContainer: {
    marginBottom: 10,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  trainerDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      conversationId: 0,
      fromUser: true,
      content: inputText.trim(),
      sentAt: new Date().toISOString(),
      isUser: true,
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Use AI provider directly (works offline with mock)
      const aiMessages: AIMessage[] = messages.map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.content,
      }));
      aiMessages.push({ role: 'user', content: userMessage.content });

      const response = await aiProvider.sendMessage(aiMessages);

      const aiMessage: ChatMessage = {
        id: messages.length + 2,
        conversationId: 0,
        fromUser: false,
        content: response.text,
        sentAt: new Date().toISOString(),
        isUser: false,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add fallback message
      const fallbackMessage: ChatMessage = {
        id: messages.length + 2,
        conversationId: 0,
        fromUser: false,
        content: 'Извини, я сейчас офлайн. Но ты молодец, что занимаешься! 💪',
        sentAt: new Date().toISOString(),
        isUser: false,
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickReplies = [
    'Как делать зарядку?',
    'Сколько монет я заработал?',
    'Дай совет по здоровью',
    'Расскажи про финансы',
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>🤖</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Светлана</Text>
            <Text style={[styles.status, isOnline ? styles.online : styles.offline]}>
              {isOnline ? 'Онлайн' : 'Офлайн'}
            </Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          ref={(ref) => {
            // Auto-scroll to bottom
            if (ref && messages.length > 0) {
              ref.scrollToEnd({ animated: true });
            }
          }}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {!message.isUser && (
                <Text style={styles.bubbleAvatar}>🤖</Text>
              )}
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.aiText,
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Text style={styles.bubbleAvatar}>🤖</Text>
              <ActivityIndicator size="small" color="#4FC3F7" />
            </View>
          )}
        </ScrollView>

        {/* Quick Replies */}
        <ScrollView horizontal style={styles.quickReplies} showsHorizontalScrollIndicator={false}>
          {quickReplies.map((reply, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickReplyChip}
              onPress={() => setInputText(reply)}
            >
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Напиши сообщение..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 12,
    marginTop: 2,
  },
  online: {
    color: '#4CAF50',
  },
  offline: {
    color: '#999',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4FC3F7',
    padding: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bubbleAvatar: {
    fontSize: 20,
    marginRight: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#333',
  },
  quickReplies: {
    maxHeight: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  quickReplyChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    marginRight: 10,
  },
  quickReplyText: {
    color: '#1976D2',
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#4FC3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
