import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParams, Message } from '../../types';
import { chatService, aiProvider, AIMessage } from '../../services/api';
import NetInfo from '@react-native-community/netinfo';

type SvetlanaScreenProps = {
  navigation: StackNavigationProp<NavigationParams, 'Svetlana'>;
};

interface ChatMessage extends Message {
  isUser: boolean;
}

export default function SvetlanaScreen({ navigation }: SvetlanaScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      conversationId: 0,
      fromUser: false,
      content: 'Привет! Я Светлана, твой ИИ-помощник! 🤖 Как дела? Готов сделать зарядку сегодня?',
      sentAt: new Date().toISOString(),
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
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
