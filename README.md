# 🎮 Local Network Remote Control System

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white)
![WebRTC](https://img.shields.io/badge/Streaming-WebRTC-FF4500?logo=webrtc&logoColor=white)

Local Network Remote Control System, akıllı telefonunuzu veya tabletinizi hiçbir uygulama indirmeden; AAA kalite bir oyun kumandasına (gamepad) ve uzak masaüstü yöneticisine dönüştüren ultra düşük gecikmeli, P2P tabanlı bir web uygulamasıdır.

## ✨ Öne Çıkan Özellikler

- **Ultra Düşük Gecikmeli Yayın:** WebRTC ile ekranınızı doğrudan yerel ağ (Wi-Fi) üzerinden saniyede 60 kare (60 FPS) hızıyla telefonunuza yansıtır.
- **Kernel Seviyesi Donanım Enjeksiyonu:** Alt seviye C/C++ işletim sistemi API'leriyle (Windows `SendInput` / macOS `CGEvent`) doğrudan konuşmak için `@nut-tree/nut.js` kütüphanesini kullanır. Bu sayede GTA 5 ve Forza Horizon gibi hile veya sanal klavye engelleyici oyun motorlarını (anti-cheat/raw-input) aşarak, komutları gerçek bir fiziksel klavyeden geliyormuş gibi işler.
- **Dinamik "Ghost UI" HUD:** Tamamen React ile geliştirilmiş, sürükle-bırak (drag-and-drop) destekli sanal oyun kumandası. Tuş dizilimleriniz, şeffaflık ayarlarınız ve klavye atamalarınız anında tarayıcınızın LocalStorage hafızasına kaydedilir.
- **Fiziksel Tuş Basılı Tutma Simülasyonu:** Yarış ve aksiyon oyunlarında kesintisiz gazlama/direksiyon kontrolü sağlayabilmek için, anlık dokunuşlar ile sürekli basılı tutma (`keydown`/`keyup`) sinyallerini birbirinden ayırır.
- **Sıfır Ağ Tıkanıklığı:** Saniyede gönderilen yüzlerce sinyalin (input) modemleri çökertmesini önlemek için Socket.IO üzerinde `requestAnimationFrame` tabanlı optimizasyon algoritmaları (throttling) kullanır.
- **%100 Gizlilik ve Güvenlik:** Tamamen kendi yerel ağınız (LAN) içinde çalışır. Verileriniz asla dış sunuculara veya buluta gitmez. İnternet bağlantınız kopsa bile ev içinde çalışmaya devam eder.

## 🏗 Mimari ve Teknoloji Yığını

- **Frontend:** React (Vite), Tailwind CSS / Vanilla CSS, WebRTC API
- **Backend:** Node.js, Express, `@nut-tree/nut.js`
- **İletişim & Signaling:** Socket.IO

## 🚀 Kurulum ve Başlangıç

### Gereksinimler
- Oyunların çalışacağı "Host" (Ana) bilgisayarda [Node.js](https://nodejs.org/) kurulu olmalıdır.
- Hem "Host" bilgisayarınızın hem de kontrol edeceğiniz cihazın (telefon/tablet) **aynı Wi-Fi ağına** bağlı olması zorunludur.

### İndirme

1. Projeyi bilgisayarınıza klonlayın:
   ```bash
   git clone https://github.com/ozknnberat/localnetworkremotecontrolsystem.git
   cd localnetworkremotecontrolsystem
   ```

2. Backend paketlerini kurun:
   ```bash
   cd backend
   npm install
   ```

3. Frontend paketlerini kurun:
   ```bash
   cd ../frontend
   npm install
   ```

### Çalıştırma

Projenin çalışması için her iki sunucuyu da "Host" bilgisayarınızda başlatmalısınız.

**1. Backend'i Başlatın:**
```bash
cd backend
npm start
```
*(Bu işlem donanım simülatörünü ve Socket sunucusunu 3001 portunda başlatır)*

**2. Frontend'i Başlatın:**
```bash
cd frontend
npm run dev
```

**3. Cihazları Bağlayın:**
- Host bilgisayarınızda terminaldeki **Network IP** adresini (örn: `https://192.168.1.100:3000`) kopyalayın ve tarayıcınıza yapıştırıp siteye girin.
- Ekranda **"Bilgisayarını Paylaş (Host)"** modunu seçin. Karşınıza kocaman bir QR kod çıkacaktır.
- Telefonunuzun (veya tabletinizin) kamerasını açarak bu QR kodu okutun.
- Bağlantı sağlandı! Telefonunuzda **"Oyuncu Modu"**nu seçerek bilgisayarınızı anında kontrol etmeye başlayabilirsiniz.

## ⚠️ Windows Oyuncuları İçin Önemli Not (GTA 5, Forza vb.)
Windows'ta yüksek donanım gerektiren büyük AAA oyunları, güvenlik sebebiyle genellikle "sanal" veya "yazılımsal" tuş vuruşlarını engeller. Eğer oyun içinde tuşlar basmıyorsa şu iki adımı mutlaka uygulayın:
1. **Yönetici Olarak Çalıştırın:** `npm start` komutunu vereceğiniz terminali (cmd veya PowerShell) kesinlikle **"Yönetici Olarak (Run as Administrator)"** açmalısınız.
2. **Çerçevesiz Pencereli Mod:** Oyun içindeki görüntü ayarlarından "Tam Ekran (Exclusive Fullscreen)" ayarını **"Windowed Borderless (Çerçevesiz Pencereli)"** olarak değiştirin.

## 👨‍💻 Geliştirme Notu
Bu proje, yüksek donanım maliyetleri engelini modern web teknolojilerinin esnekliği ve "Vibe Coding" metodolojileri kullanılarak aşmak amacıyla geliştirilmiştir. Deneyimleriniz ve geri bildirimleriniz benim için çok değerlidir!
