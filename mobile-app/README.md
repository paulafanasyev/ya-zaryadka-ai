# Я-Зарядка AI Mobile App

Интерактивное мобильное приложение для детей 6–14 лет, сочетающее утреннюю зарядку, творческие задания и игровые элементы.

## Особенности

- **Утренняя зарядка**: 8+ упражнений с таймером и подсчётом повторений
- **ИИ-помощник Светлана**: Чат-бот для поддержки и мотивации (OpenAI/Gemini/Anthropic)
- **Творчество**: Рисование на холсте с сохранением работ
- **Достижения**: Система наград за активность
- **Родительский режим**: Контроль статистики и настроек
- **Offline-first**: Работа без интернета (кроме AI-чата)
- **Компьютерное зрение**: Распознавание упражнений (MediaPipe/MoveNet)

## Технологии

- React Native + Expo
- TypeScript
- React Navigation
- AsyncStorage (локальное хранилище)
- MediaPipe BlazePose / MoveNet (CV)
- Jest + Detox (тесты)

## Установка

```bash
cd mobile-app
npm install
```

## Запуск

```bash
# Development
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## Тесты

```bash
# Unit tests
npm test

# E2E tests (Detox)
npm run test:e2e
```

## Сборка APK

```bash
npm run build:apk
```

## Структура проекта

```
mobile-app/
├── src/
│   ├── screens/        # Экраны приложения
│   ├── components/     # Переиспользуемые компоненты
│   ├── services/       # API, AI Provider, CV Service
│   ├── navigation/     # Навигация
│   ├── store/          # State management
│   ├── types/          # TypeScript типы
│   └── utils/          # Утилиты
├── assets/             # Изображения, шрифты
├── __tests__/          # Тесты
└── app.json            # Конфигурация Expo
```

## Архитектура

```
┌─────────────────┐     ┌─────────────────┐
│  Mobile Client  │────▶│   Backend API   │
│ (React Native)  │◀────│  (Node.js/TS)   │
└────────┬────────┘     └────────┬────────┘
         │                       │
    ┌────▼─────┐           ┌─────▼──────┐
    │LocalStore│           │ PostgreSQL │
    │(AsyncStor)│          │    + S3    │
    └──────────┘           └─────┬──────┘
         │                       │
    ┌────▼─────┐           ┌─────▼──────┐
    │   CV     │           │ AIProvider │
    │(MediaPipe)│          │(OpenAI/etc)│
    └──────────┘           └────────────┘
```

## Лицензия

MIT
