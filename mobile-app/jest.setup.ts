import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => () => {}),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
}));

// Mock AI Provider
jest.mock('./src/services/aiProvider', () => ({
  aiProvider: {
    sendMessage: jest.fn(() => Promise.resolve({ text: 'Mock response' })),
    updateConfig: jest.fn(),
  },
  default: class AIProvider {
    constructor() {}
    async sendMessage() {
      return { text: 'Mock response' };
    }
    updateConfig() {}
  },
}));
