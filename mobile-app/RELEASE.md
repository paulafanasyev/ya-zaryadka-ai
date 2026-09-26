# Релизная сборка для RuStore

Сборку делает GitHub Actions (`.github/workflows/android-apk.yml`) при каждом push в ветку `apk-build`.

Шаги конвейера:

1. Юнит-тесты детектора движений (`npm run test:cv`).
2. Сборка APK и AAB. Модель позы и MediaPipe встраиваются в APK, интернет для зарядки не нужен.
3. Тест на эмуляторе Android 13 (Maestro, `e2e/flows/main.yaml`). Скриншоты и logcat лежат в артефакте `emulator-results`.
4. Публикация GitHub Release `v<версия>-build.<номер>`: APK, AAB, SHA256SUMS.txt, signature.txt, иконка 512x512.

`versionCode` = 1000 + номер запуска конвейера. Он всегда растёт, как требует RuStore.

## Подпись

RuStore принимает только APK, подписанный релизным ключом (схемы v1, v2, v3). Все обновления должны быть подписаны тем же ключом.

### Вариант 1 (простой): один секрет

1. GitHub: Settings > Secrets and variables > Actions > New repository secret.
2. Имя: `ANDROID_KEYSTORE_PASSWORD`. Значение: случайный пароль не короче 20 символов (буквы и цифры).
3. Запустите конвейер (Actions > Android APK > Run workflow).

При первом запуске CI создаёт ключ (RSA 4096, alias `yazaryadka`, срок 10000 дней), шифрует его AES-256 (PBKDF2, 200000 итераций) и кладёт в `mobile-app/signing/release.keystore.enc`. Дальше CI расшифровывает его тем же паролем.

Важно:

- Сохраните пароль в менеджере паролей. Без него нельзя выпустить обновление в RuStore.
- Скачайте копию `release.keystore.enc` в надёжное место.
- Репозиторий публичный, поэтому стойкость ключа зависит только от пароля. Если нужна максимальная защита, используйте вариант 2 или сделайте репозиторий приватным.

### Вариант 2: свой keystore

```
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias yazaryadka -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 release.keystore
```

Секреты: `ANDROID_KEYSTORE_BASE64` (вывод base64), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` (для PKCS12 совпадает с паролем хранилища).

### Без секретов

APK подписывается отладочным ключом. Такой APK подходит для теста, но не для RuStore.

## Проверка подписи

Файл `signature.txt` в релизе содержит вывод `apksigner verify --verbose --print-certs`. В нём должны быть строки `Verified using v1 scheme: true`, `v2: true`, `v3: true`, а владелец сертификата `CN=Ya-Zaryadka AI`.
