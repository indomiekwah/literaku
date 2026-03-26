# Literaku - Build APK dengan Android Studio

## Prasyarat

1. **Android Studio** (versi terbaru) - [download](https://developer.android.com/studio)
2. **Node.js** >= 18 - [download](https://nodejs.org/)
3. **pnpm** >= 8 - `npm install -g pnpm`
4. **Java JDK 17** (biasanya sudah termasuk di Android Studio)

---

## Langkah 1: Download Project dari Replit

Di Replit, klik menu **⋮** (3 titik) di sidebar → **Download as ZIP**.

Atau gunakan Git:
```bash
git clone <your-replit-git-url> literaku
cd literaku
```

---

## Langkah 2: Install Dependencies

```bash
pnpm install
```

---

## Langkah 3: Set Environment Variables

Buat file `.env` di `artifacts/mobile/`:

```env
EXPO_PUBLIC_DOMAIN=<URL_API_SERVER_ANDA>
```

**Penting:** `EXPO_PUBLIC_DOMAIN` harus mengarah ke API server yang sudah di-deploy (bukan localhost). Contoh:
- Jika deploy di Azure: `literaku-api.azurewebsites.net`
- Jika deploy di Replit: `<repl-name>.<username>.repl.co`

---

## Langkah 4: Buka di Android Studio

1. Buka **Android Studio**
2. Pilih **Open an existing project**
3. Navigasi ke folder `artifacts/mobile/android` → klik **Open**
4. Tunggu Gradle sync selesai (bisa 3-5 menit pertama kali)

---

## Langkah 5: Konfigurasi local.properties

Android Studio biasanya membuat file ini otomatis. Jika tidak, buat manual di `artifacts/mobile/android/local.properties`:

```properties
sdk.dir=/Users/<username>/Library/Android/sdk
```

Ganti path sesuai lokasi Android SDK di laptop Anda:
- **macOS**: `/Users/<username>/Library/Android/sdk`
- **Windows**: `C:\\Users\\<username>\\AppData\\Local\\Android\\Sdk`
- **Linux**: `/home/<username>/Android/Sdk`

---

## Langkah 6: Build APK (Debug)

### Opsi A: Dari Android Studio
1. Pilih menu **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Tunggu build selesai
3. APK tersedia di: `artifacts/mobile/android/app/build/outputs/apk/debug/app-debug.apk`

### Opsi B: Dari Terminal
```bash
cd artifacts/mobile/android
./gradlew assembleDebug
```

APK tersedia di: `app/build/outputs/apk/debug/app-debug.apk`

---

## Langkah 7: Install ke HP Android

### Opsi A: Langsung dari Android Studio
1. Hubungkan HP Android via USB (aktifkan **Developer Options** & **USB Debugging**)
2. Pilih device di toolbar Android Studio
3. Klik tombol **Run** ▶️

### Opsi B: Install APK manual
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Opsi C: Transfer APK ke HP
Copy file `app-debug.apk` ke HP via kabel/email/Google Drive, lalu install.

---

## Build Production (Release APK / AAB)

### 1. Buat Keystore (sekali saja)
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore literaku-release.keystore -alias literaku -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Konfigurasi Signing
Edit `artifacts/mobile/android/app/build.gradle`, tambahkan di block `android`:

```gradle
signingConfigs {
    release {
        storeFile file('literaku-release.keystore')
        storePassword 'YOUR_STORE_PASSWORD'
        keyAlias 'literaku'
        keyPassword 'YOUR_KEY_PASSWORD'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 3. Build Release
```bash
cd artifacts/mobile/android

# APK
./gradlew assembleRelease

# AAB (untuk Google Play Store)
./gradlew bundleRelease
```

---

## Troubleshooting

### Gradle sync gagal
- Pastikan Java 17 sudah terinstall
- File → Invalidate Caches → Restart

### Metro bundler error
- Jalankan `pnpm install` ulang dari root project
- Hapus cache: `cd artifacts/mobile && pnpm exec expo start --clear`

### Build error "SDK location not found"
- Buat file `local.properties` sesuai Langkah 5

### Permission denied (macOS/Linux)
```bash
chmod +x artifacts/mobile/android/gradlew
```

---

## Struktur File Android

```
artifacts/mobile/android/
├── app/
│   ├── build.gradle          # App-level build config
│   └── src/main/
│       ├── AndroidManifest.xml   # Permissions & app config
│       ├── java/                 # Native Java code
│       └── res/                  # Icons, splash screen, etc.
├── build.gradle              # Project-level build config
├── gradle.properties         # Gradle settings
├── gradlew                   # Gradle wrapper (Linux/macOS)
├── gradlew.bat              # Gradle wrapper (Windows)
└── settings.gradle          # Module settings
```
