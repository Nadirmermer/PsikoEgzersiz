
# PsikoEgzersiz

![PsikoEgzersiz](https://via.placeholder.com/800x400/6366f1/ffffff?text=PsikoEgzersiz)

## Proje Hakkında

PsikoEgzersiz, beyin sağlığını desteklemek ve bilişsel yetenekleri geliştirmek amacıyla tasarlanmış modern bir cross-platform uygulamasıdır. Web, Windows, macOS ve Linux platformlarında çalışabilen bu uygulama, ruh sağlığı uzmanları ve bireysel kullanıcılar için kapsamlı bilişsel egzersiz çözümleri sunar.

Uygulama, bilimsel araştırmalara dayalı egzersizler sunarak hafıza, dikkat, problem çözme ve mantıksal düşünme becerilerini geliştirmeyi hedefler. Uzman-danışan etkileşimi ve detaylı ilerleme takibi ile profesyonel kullanım için de uygundur.

## Öne Çıkan Özellikler

### 🧠 9 Farklı Bilişsel Egzersiz
- **Hafıza Oyunu**: Kart eşleştirme ile görsel hafızayı güçlendirme
- **Resim-Kelime Eşleştirme**: Görsel-dil bağlantısını geliştirme
- **Kelime-Resim Eşleştirme**: Kavramsal anlayışı artırma
- **Londra Kulesi Testi**: Planlama ve problem çözme becerileri
- **Hanoi Kuleleri**: Algoritma ve strateji geliştirme (18 seviye)
- **Sayı Dizisi Takibi**: Çalışan hafıza ve konsantrasyon
- **Renk Dizisi Takibi**: Görsel hafıza ve dikkati geliştirme
- **Kelime Çemberi Bulmacası**: Dil becerileri ve kelime bilgisi
- **Mantık Dizileri**: Analitik düşünme ve örüntü tanıma

### 👨‍⚕️ Uzman Desteği
- Ruh sağlığı uzmanları için özel dashboard
- Danışan ilerleme takibi ve analizi
- Detaylı performans raporları
- Güvenli uzman-danışan bağlantısı

### 📊 Kapsamlı İstatistikler
- Bireysel egzersiz performans analizi
- Zaman içindeki ilerleme grafikleri
- Karşılaştırmalı analiz araçları
- Exportable raporlar

### ♿ Erişilebilirlik Özellikleri
- WCAG 2.1 AA uyumluluğu
- Disleksi okuma modu
- Klavye navigasyonu desteği
- Yüksek kontrast seçenekleri
- Responsive tasarım

### 🎨 Modern UI/UX
- Tablet-first responsive tasarım
- Açık/koyu tema desteği
- Smooth animasyonlar
- Kullanıcı dostu arayüz

## Ekran Görüntüleri

<!-- Ekran görüntüleri buraya eklenecek -->
*Yakında: Ana sayfa, egzersiz seçimi, oyun içi görünüm ve istatistik sayfaları*

## Kullanılan Teknolojiler

### Frontend
- **React 18** - Modern UI geliştirme
- **TypeScript** - Tip güvenliği
- **Vite** - Hızlı build sistemi
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI bileşenleri

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - İlişkisel veritabanı
- **Row Level Security** - Veri güvenliği

### Charts & Visualization
- **Recharts** - Veri görselleştirme
- **Lucide React** - İkon kütüphanesi

### Desktop & Deployment  
- **Electron** - Cross-platform masaüstü uygulaması
- **Capacitor** - Cross-platform mobil uygulama
- **Netlify** - Web hosting ve deployment

## Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18 veya üzeri
- npm veya yarn
- Git

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/your-username/psikoegzersiz.git
cd psikoegzersiz
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
# veya
yarn install
```

### 3. Supabase Kurulumu
1. [Supabase](https://supabase.com) hesabınızda yeni bir proje oluşturun
2. Supabase SQL editöründe `supabase/migrations/001_complete_schema_with_permissions.sql` dosyasını çalıştırın
3. Proje kök dizininde `.env` dosyası oluşturun:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Uygulamayı Çalıştırın
```bash
npm run dev
# veya
yarn dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

## Dağıtım (Deployment)

### Web Dağıtımı (Netlify)
1. GitHub'a push yapın
2. Netlify'de repositoriyi bağlayın
3. Environment variables'ları ayarlayın:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy butonuna tıklayın

Netlify otomatik olarak `netlify.toml` yapılandırmasını kullanacaktır.

### Masaüstü Uygulaması (Electron)
```bash
# Electron bağımlılıklarını yükleyin
npm install

# Geliştirme modunda çalıştırın
npm run electron:dev

# Production build oluşturun
npm run electron:build

# Dağıtım paketleri oluşturun
npm run electron:dist
```

### Mobil Uygulama (Capacitor)
```bash
# Build oluşturun
npm run build

# Capacitor sync
npx cap sync

# Android için
npx cap run android

# iOS için (macOS gerekli)
npx cap run ios
```

Detaylı bilgi için `capacitor.config.json` dosyasına bakın.

## Kullanım

### Bireysel Kullanıcılar
1. Uygulamayı açın
2. Egzersiz türünü seçin
3. Talimatları okuyun
4. Egzersizi tamamlayın
5. İlerlemelerinizi İstatistikler bölümünden takip edin

### Ruh Sağlığı Uzmanları
1. Ayarlar > Ruh Sağlığı Uzmanı bölümünden giriş yapın
2. Uzman Dashboard'unu kullanın
3. Danışanlarınızın ilerlemesini takip edin
4. Detaylı raporları inceleyin

## Katkıda Bulunma

Bu proje açık kaynak olarak geliştirilmektedir. Katkılarınızı memnuniyetle karşılıyoruz!

### Katkı Süreci
1. Bu repositoriyi fork edin
2. Yeni bir feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

### Geliştirme Kuralları
- TypeScript kullanın
- ESLint kurallarına uyun
- Responsive tasarım prensiplerini takip edin
- Erişilebilirlik standartlarını gözetin
- Commit mesajlarını açıklayıcı yazın

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## Cross-Platform Dağıtım Rehberi

### 🌐 Web Dağıtımı (Netlify)

#### Otomatik Dağıtım
```bash
# Değişiklikleri push edin
git add .
git commit -m "Update: yeni özellik eklendi"
git push origin main
```

Netlify otomatik olarak deploy edecek.

#### Manuel Kontrol
```bash
# Build test et
npm run build
npm run preview

# Problem yoksa push et
git push origin main
```

### 🖥️ Masaüstü Dağıtımı (Electron)

#### Geliştirme Süreci
```bash
# 1. Web build
npm run build

# 2. Electron dev test
npm run electron:dev

# 3. Production build
npm run electron:build

# 4. Dağıtım paketleri (Windows .exe, macOS .dmg, Linux .AppImage)
npm run electron:dist
```

#### Günlük Workflow
```bash
# Kod değişikliği sonrası
npm run build              # Web build
npm run electron:dev       # Test et
npm run electron:dist      # Release hazırla
```

### 📱 Mobil Dağıtımı (Capacitor)

#### Android Workflow
```bash
# 1. Web build
npm run build

# 2. Capacitor sync (assets kopyala)
npx cap copy android

# 3. Android Studio'da build et
npx cap open android
# Android Studio'da: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

#### iOS Workflow (macOS gerekli)
```bash
npm run build
npx cap copy ios
npx cap open ios
# Xcode'da build et
```

#### Hızlı Test Döngüsü
```bash
# Değişiklik sonrası
npm run build && npx cap copy android && npx cap open android
```

### 🔧 Environment Variables

#### Web (.env)
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Netlify Dashboard
- Site settings → Environment variables
- Build settings → Environment variables

### 📦 Release Checklist

#### Her Release Öncesi
- [ ] `npm run build` başarılı
- [ ] `npm run lint` temiz
- [ ] Tüm egzersizler çalışıyor
- [ ] Responsive tasarım kontrol
- [ ] Cross-browser test (Chrome, Firefox, Safari)

#### Version Bump
```bash
# package.json version güncellemesi
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.1 → 1.1.0
npm version major  # 1.1.0 → 2.0.0

git push origin main --tags
```

### 🚀 Hızlı Komutlar

#### Günlük Geliştirme
```bash
# Dev server başlat
npm run dev

# Build test et
npm run build && npm run preview

# Lint kontrol
npm run lint

# TypeScript kontrol
npm run type-check
```

#### Capacitor Günlük
```bash
# Android quick deploy
npm run build && npx cap copy android && npx cap run android

# iOS quick deploy
npm run build && npx cap copy ios && npx cap run ios

# Capacitor doctor (sorun kontrol)
npx cap doctor
```

#### Electron Günlük
```bash
# Quick test
npm run build && npm run electron:dev

# Production build
npm run electron:build

# Full distribution
npm run electron:dist
```

### 🐛 Common Issues & Solutions

#### Android Build Sorunları
```bash
# Java version error
# Çözüm: Android Studio embedded JDK kullan

# SDK not found
# Çözüm: ANDROID_HOME environment variable ayarla
export ANDROID_HOME=/path/to/Android/Sdk

# Gradle issues
cd android && ./gradlew clean && cd ..
```

#### Electron Build Sorunları
```bash
# Node modules temizle
rm -rf node_modules package-lock.json
npm install

# Electron rebuild
npm run electron:rebuild
```

#### Web Build Sorunları
```bash
# Cache temizle
rm -rf dist node_modules/.vite
npm run build
```

### 📊 Platform-Specific Tips

#### Web Optimizasyonu
- Bundle analyzer kullan: `npm run build -- --analyze`
- Lighthouse score kontrol et
- PWA features test et

#### Electron Optimizasyonu
- Auto-updater implement et
- Native menu'ları optimize et
- Security best practices uygula

#### Mobile Optimizasyonu
- Touch events test et
- Hardware back button handle et
- Splash screen optimize et
- App icons güncelle

### 🔄 CI/CD Pipeline

#### GitHub Actions (Önerilen)
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install and Build
        run: |
          npm install
          npm run build
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Android Studio Kurulum ve Konfigürasyon

### 🛠️ İlk Kurulum

#### 1. Android Studio İndirin
- **Link:** https://developer.android.com/studio
- **Boyut:** ~3 GB
- **Platform:** Windows/macOS/Linux

#### 2. Kurulum Adımları
1. Android Studio installer'ı çalıştırın
2. "Standard" setup seçin (önerilen)
3. Android SDK otomatik kurulacak
4. Sanal cihaz (emulator) kuracak

#### 3. Environment Variables (Windows)
```powershell
# ANDROID_HOME ayarlama
$env:ANDROID_HOME = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"

# PATH'e ekleme
$env:PATH += ";$env:ANDROID_HOME\tools;$env:ANDROID_HOME\platform-tools"

# Kalıcı olarak kaydetme
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $env:ANDROID_HOME, "User")
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
[Environment]::SetEnvironmentVariable("PATH", "$currentPath;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\platform-tools", "User")
```

#### 4. Doğrulama
```bash
# Android SDK kontrol
echo $ANDROID_HOME

# ADB kontrol  
adb version

# Java kontrol
java -version
```

### 📱 APK Oluşturma

#### Debug APK (Test için)
1. Android Studio'da proje açın: `npx cap open android`
2. `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
3. APK konumu: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Release APK (Dağıtım için)
1. `Build` → `Generate Signed Bundle / APK`
2. `APK` seçin → `Next`
3. Keystore oluşturun veya mevcut keystore'u kullanın
4. APK konumu: `android/app/build/outputs/apk/release/`

### 🔧 Troubleshooting

#### Gradle Sync Hatası
1. **File → Settings → Build → Gradle**
2. **Gradle JDK:** "Embedded JDK" seçin
3. **Apply** → **OK**

#### SDK Eksik Paketi
1. **Tools → SDK Manager**
2. **API Level 34** (Android 14) kontrol edin
3. **Apply** tıklayın

#### USB Debugging
1. Telefonda: **Ayarlar → Geliştirici Seçenekleri**
2. **USB Debugging** açın
3. **USB için:** "File Transfer" seçin

### 🎯 APK File Names

- **`app-debug.apk`** → Ana uygulama (kullanın)
- **`app-debug-androidTest.apk`** → Test dosyası (silinebilir)
- **Telefondaki Ad:** "PsikoEgzersiz" (strings.xml'den gelir)

## Destek ve İletişim

### 📧 İletişim
Sorularınız, önerileriniz veya hata bildirimleri için:

- **GitHub Issues:** Hata bildirimleri ve özellik önerileri
- **Email:** 1nadirmermer@gmail.com
- **Developer:** Nadir Mermer

### 🤝 Teşekkürler
Bu projeyi kullandığınız için teşekkür ederiz! Beyin sağlığınız için tasarlanan bu uygulamanın faydalı olması dileğiyle.

## Geliştiriciler

- **Ana Geliştirici**: Nadir MERMER
- **UI/UX Tasarım**: Nadir MERMER
- **Bilişsel Uzman Danışman**: Nadir MERMER

---

**Not**: Bu uygulama bilişsel egzersiz amaçlıdır ve profesyonel tıbbi tavsiye yerine geçmez. Ciddi bilişsel sorunlar için lütfen bir sağlık uzmanına başvurun.

## Versiyon Geçmişi

- **v1.0.0** - İlk stabil sürüm
- **v0.9.0** - Beta sürüm
- **v0.8.0** - Alpha sürüm

## Teşekkürler

- React toplulugu
- Supabase ekibi
- Shadcn/ui katkıcıları
- Tüm açık kaynak katkıcılarına
