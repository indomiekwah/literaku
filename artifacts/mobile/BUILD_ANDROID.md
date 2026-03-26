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

## Langkah 2: Install Dependencies (WAJIB sebelum buka Android Studio)

Buka **Command Prompt** atau **PowerShell**, masuk ke folder root project:

```bash
cd D:\Data_Sementara\Literaku_IC
pnpm install
```

**PENTING untuk Windows:** Jika `pnpm install` gagal karena symlink, jalankan PowerShell sebagai **Administrator** lalu:
```bash
pnpm install --config.node-linker=hoisted
```

Atau alternatif: gunakan `npm` sebagai gantinya:
```bash
npm install
```

Pastikan `node_modules` folder tercipta di root project DAN di `artifacts/mobile/`.

---

## Langkah 3: Verifikasi Node Bisa Resolve Packages

Sebelum buka Android Studio, test dulu dari terminal:

```bash
cd artifacts\mobile
node --print "require.resolve('react-native/package.json')"
node --print "require.resolve('expo/package.json')"
```

Jika kedua command di atas menampilkan path file, berarti siap untuk Android Studio.

Jika ERROR "Cannot find module", jalankan ulang `pnpm install` dari root project.

---

## Langkah 4: Set Environment Variables

Buat file `.env` di `artifacts/mobile/`:

```env
EXPO_PUBLIC_DOMAIN=<URL_API_SERVER_ANDA>
```

**Penting:** `EXPO_PUBLIC_DOMAIN` harus mengarah ke API server yang sudah di-deploy (bukan localhost). Contoh:
- Jika deploy di Azure: `literaku-api.azurewebsites.net`
- Jika deploy di Replit: `<repl-name>.<username>.repl.co`

---

## Langkah 5: Buka di Android Studio

1. Buka **Android Studio**
2. Pilih **Open an existing project**
3. Navigasi ke folder `artifacts/mobile/android` → klik **Open**
4. Tunggu Gradle sync selesai (bisa 3-5 menit pertama kali)

**PENTING:** Pastikan Node.js ada di System PATH. Android Studio harus bisa menemukan `node` command. Jika Gradle sync gagal:
- Buka **File → Settings → Tools → Terminal** dan pastikan PATH termasuk folder Node.js
- Biasanya: `C:\Program Files\nodejs\`

---

## Langkah 6: Konfigurasi local.properties

Android Studio biasanya membuat file ini otomatis. Jika tidak, buat manual di `artifacts/mobile/android/local.properties`:

```properties
sdk.dir=C:\\Users\\<username>\\AppData\\Local\\Android\\Sdk
```

Ganti `<username>` dengan username Windows kamu.

---

## Langkah 7: Build APK (Debug)

### Opsi A: Dari Android Studio
1. Pilih menu **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Tunggu build selesai
3. APK tersedia di: `artifacts/mobile/android/app/build/outputs/apk/debug/app-debug.apk`

### Opsi B: Dari Terminal (PowerShell/CMD)
```bash
cd artifacts\mobile\android
.\gradlew.bat assembleDebug
```

APK tersedia di: `app\build\outputs\apk\debug\app-debug.apk`

---

## Langkah 8: Install ke HP Android

### Opsi A: Langsung dari Android Studio
1. Hubungkan HP Android via USB (aktifkan **Developer Options** & **USB Debugging**)
2. Pilih device di toolbar Android Studio
3. Klik tombol **Run** ▶️

### Opsi B: Install APK manual
```bash
adb install app\build\outputs\apk\debug\app-debug.apk
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
cd artifacts\mobile\android

:: APK
.\gradlew.bat assembleRelease

:: AAB (untuk Google Play Store)
.\gradlew.bat bundleRelease
```

---

## Troubleshooting

### Error "Process 'command node' finished with non-zero exit value 1"
Ini artinya Gradle tidak bisa menjalankan Node.js. Solusi:
1. Pastikan **Node.js** sudah terinstall: buka CMD, ketik `node --version`
2. Pastikan sudah menjalankan `pnpm install` dari **root project** (bukan dari folder android)
3. Verifikasi packages bisa di-resolve: `cd artifacts\mobile && node --print "require.resolve('react-native/package.json')"`
4. Jika pakai pnpm di Windows dan ada masalah symlink, coba: `pnpm install --config.node-linker=hoisted`
5. Restart Android Studio setelah install dependencies

### Gradle sync gagal
- Pastikan Java 17 sudah terinstall
- File → Invalidate Caches → Restart

### Metro bundler error
- Jalankan `pnpm install` ulang dari root project
- Hapus cache: `cd artifacts/mobile && pnpm exec expo start --clear`

### Build error "SDK location not found"
- Buat file `local.properties` sesuai Langkah 6

---

## Struktur Folder

```
Literaku_IC/                          ← ROOT PROJECT
├── pnpm-workspace.yaml
├── package.json
├── node_modules/                     ← HARUS ADA (pnpm install)
├── artifacts/
│   └── mobile/                       ← Expo project root
│       ├── package.json
│       ├── node_modules/             ← HARUS ADA
│       ├── app/                      ← React Native screens
│       ├── services/                 ← Speech, voice services
│       └── android/                  ← BUKA INI DI ANDROID STUDIO
│           ├── app/
│           │   ├── build.gradle
│           │   └── src/main/
│           │       ├── AndroidManifest.xml
│           │       ├── java/
│           │       └── res/
│           ├── build.gradle
│           ├── gradle.properties
│           ├── gradlew              (Linux/macOS)
│           ├── gradlew.bat          (Windows)
│           └── settings.gradle
│   └── api-server/                   ← Backend API
└── lib/                              ← Shared libraries
```

**Kunci penting:** Folder `node_modules` HARUS ada di root project dan di `artifacts/mobile/` sebelum membuka Android Studio.
