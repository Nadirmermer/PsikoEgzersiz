 # 🎵 Ses Dosyaları Rehberi

Bu klasör, Bilişsel Egzersiz Uygulaması için gerekli ses dosyalarını içerir.

## 📁 Klasör Yapısı

```
public/audio/
├── ui/                    # UI ses efektleri
├── exercises/             # Egzersiz sesleri
├── feedback/              # Geri bildirim sesleri
└── ambient/               # Ortam sesleri
```

## 🎯 Gerekli Ses Dosyaları

### 1. UI Ses Efektleri (`ui/`)
- `button-click.mp3` - Buton tıklama sesi
- `button-hover.mp3` - Buton hover sesi
- `page-transition.mp3` - Sayfa geçiş sesi
- `notification.mp3` - Bildirim sesi

### 2. Egzersiz Sesleri (`exercises/`)
- `exercise-start.mp3` - Egzersiz başlangıç sesi
- `exercise-complete.mp3` - Egzersiz tamamlama sesi
- `level-up.mp3` - Seviye atlama sesi
- `countdown.mp3` - Geri sayım sesi
- `timer-tick.mp3` - Zamanlayıcı tik sesi

### 3. Geri Bildirim Sesleri (`feedback/`)
- `correct-answer.mp3` - Doğru cevap sesi
- `wrong-answer.mp3` - Yanlış cevap sesi
- `perfect-score.mp3` - Mükemmel skor sesi
- `achievement.mp3` - Başarı sesi

### 4. Ortam Sesleri (`ambient/`)
- `focus-ambient.mp3` - Odaklanma için ortam sesi
- `relaxing-background.mp3` - Rahatlatıcı arka plan sesi

## 🔍 Ses Dosyası Özellikleri

### Format: MP3
- **Bit Rate:** 128 kbps (optimum kalite/boyut dengesi)
- **Sample Rate:** 44.1 kHz
- **Channels:** Stereo
- **Duration:** 
  - UI efektleri: 0.1-0.5 saniye
  - Egzersiz sesleri: 1-3 saniye
  - Geri bildirim: 0.5-2 saniye
  - Ortam sesleri: 30-60 saniye (loop)

## 📥 Nereden Bulabilirsiniz?

### 1. Ücretsiz Ses Kütüphaneleri:
- **Freesound.org** - Geniş ses arşivi
- **Zapsplat.com** - Profesyonel ses efektleri
- **Adobe Audition** - Ücretsiz ses paketi
- **YouTube Audio Library** - Telif hakkı olmayan sesler

### 2. Önerilen Arama Terimleri:
- "button click sound effect"
- "success notification sound"
- "game level complete"
- "correct answer chime"
- "wrong answer buzz"
- "ambient focus music"
- "countdown beep"
- "achievement unlock"

### 3. Ses Türleri:
- **UI Sesler:** Kısa, net, profesyonel
- **Başarı Sesleri:** Pozitif, motive edici
- **Hata Sesleri:** Nazik, cesaretlendirici (sert değil)
- **Ortam Sesleri:** Sakin, odaklanmaya yardımcı

## ⚙️ Teknik Notlar

- Tüm ses dosyaları `public/audio/` klasöründe olmalı
- Dosya adları küçük harf ve tire ile yazılmalı
- Ses seviyesi normalize edilmeli (çok yüksek/düşük olmamalı)
- Mobil cihazlarda da çalışacak şekilde optimize edilmeli

## 🎨 Ses Tasarım İlkeleri

1. **Tutarlılık:** Tüm sesler aynı tonda/karakterde
2. **Erişilebilirlik:** İşitme engelli kullanıcılar için görsel geri bildirim
3. **Ayarlanabilirlik:** Kullanıcı ses seviyesini ayarlayabilmeli
4. **Performans:** Dosya boyutları küçük tutulmalı

---

**Not:** Ses dosyalarını ekledikten sonra bu README'yi güncelleyebilirsiniz.