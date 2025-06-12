
# Bilişsel Egzersiz Uygulaması

![Bilişsel Egzersiz Uygulaması](https://via.placeholder.com/800x400/6366f1/ffffff?text=Bilişsel+Egzersiz+Uygulaması)

## Proje Hakkında

Bilişsel Egzersiz Uygulaması, beyin sağlığını desteklemek ve bilişsel yetenekleri geliştirmek amacıyla tasarlanmış modern bir web uygulamasıdır. Tablet ve mobil cihazlarda kullanım için optimize edilmiş olan bu platform, ruh sağlığı uzmanları ve bireysel kullanıcılar için kapsamlı bilişsel egzersiz çözümleri sunar.

Uygulama, bilimsel araştırmalara dayalı egzersizler sunarak hafıza, dikkat, problem çözme ve mantıksal düşünme becerilerini geliştirmeyi hedefler. Uzman-danışan etkileşimi ve detaylı ilerleme takibi ile profesyonel kullanım için de uygundur.

## Öne Çıkan Özellikler

### 🧠 8 Farklı Bilişsel Egzersiz
- **Hafıza Oyunu**: Kart eşleştirme ile görsel hafızayı güçlendirme
- **Resim-Kelime Eşleştirme**: Görsel-dil bağlantısını geliştirme
- **Kelime-Resim Eşleştirme**: Kavramsal anlayışı artırma
- **Londra Kulesi Testi**: Planlama ve problem çözme becerileri
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

### Mobile & Deployment
- **Capacitor** - Cross-platform mobil uygulama
- **Netlify** - Web hosting ve deployment

## Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18 veya üzeri
- npm veya yarn
- Git

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/your-username/cognitive-exercise-app.git
cd cognitive-exercise-app
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

## Destek ve İletişim

Sorularınız, önerileriniz veya hata bildirimleri için:
- GitHub Issues kullanın
- Email: [proje-email@example.com](mailto:proje-email@example.com)

## Geliştiriciler

- **Ana Geliştirici**: [Your Name]
- **UI/UX Tasarım**: [Designer Name]
- **Bilişsel Uzman Danışman**: [Expert Name]

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
