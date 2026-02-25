# Win-Package-UI - Product Requirements Document (PRD)

**Versiyon:** 1.0
**Tarih:** 2026-02-25
**Durum:** Aktif Gelistirme

---

## 1. Urun Ozeti

**Win-Package-UI**, Windows kullanicilarina birden fazla paket yoneticisini (WinGet, Chocolatey, Microsoft Store) tek bir modern ve kullanici dostu grafik arayuzde birlestiren bir masaustu uygulamasidir. Kullanicilar komut satiri bilgisine ihtiyac duymadan yazilim yukleyebilir, guncelleyebilir ve kaldirabilir.

### 1.1 Vizyon

Windows ekosistemindeki parcali paket yonetimi deneyimini, tum kaynaklari tek bir arayuzde birlestirerek basitlestirmek.

### 1.2 Hedef Kitle

| Segment | Aciklama |
|---------|----------|
| **Son Kullanicilar** | Komut satirina asina olmayan, yazilimlarini gorsel arayuzle yonetmek isteyen Windows kullanicilari |
| **Gelistiriciler** | Gelistirme ortamlarini hizla kurmak ve yonetmek isteyen yazilim gelistiriciler |
| **IT Yoneticileri** | Birden fazla makinedeki yazilimlari toplu yonetmek isteyen sistem yoneticileri |

### 1.3 Temel Deger Onermesi

- Birden fazla paket yoneticisini acmaya gerek kalmadan tek noktadan erisim
- Komut satiri bilgisi gerektirmeyen sezgisel arayuz
- Toplu guncelleme ve islem takibi
- Coklu dil ve tema destegi ile kisisellestirilmis deneyim

---

## 2. Teknik Mimari

### 2.1 Teknoloji Yigini

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| **Frontend Framework** | Vue 3 (Composition API) | 3.5.26 |
| **Dil** | TypeScript | 5.5.0 |
| **Build Araci** | Vite | 5.0.0 |
| **Masaustu Framework** | Tauri | 2.9.6 |
| **Stil** | Tailwind CSS | 3.4.19 |
| **State Yonetimi** | Pinia | 3.0.4 |
| **Routing** | Vue Router | 4.6.4 |
| **i18n** | vue-i18n | 11.2.2 |
| **UI Komponentleri** | Reka-UI (Headless) | - |
| **Ikonlar** | Lucide Vue Next | - |

### 2.2 Mimari Kararlar

- **Tauri (Electron yerine):** Daha dusuk bellek kullanimi, Rust backend, hizli baslangic suresi
- **Plugin Mimarisi:** Yeni paket yoneticileri kolayca eklenebilir (apt, pacman vb.)
- **Komut Sablonlari:** Enjeksiyon saldirilarina karsi guvenli komut olusturma
- **HSL Renk Sistemi:** Dinamik tema degisimi icin hex yerine HSL bazli renkler
- **TTL Tabali Onbellek:** Sistem komutu yukunu azaltmak icin 6 saatlik onbellek

### 2.3 Sistem Mimarisi

```
+------------------+     +------------------+     +-------------------+
|   Vue 3 UI       | <-> |   Pinia Store    | <-> | Package Registry  |
| (Tailwind CSS)   |     | (State Yonetimi) |     | (Plugin Sistemi)  |
+------------------+     +------------------+     +-------------------+
                                                          |
                                               +----------+----------+
                                               |          |          |
                                          +--------+ +--------+ +--------+
                                          | Winget | | Choco  | |MSStore |
                                          |Provider| |Provider| |Provider|
                                          +--------+ +--------+ +--------+
                                               |          |          |
                                          +----+----------+----------+----+
                                          |     Command Builder           |
                                          |   (Sablon + Validasyon)       |
                                          +-------------------------------+
                                                       |
                                          +-------------------------------+
                                          |   Tauri IPC Service           |
                                          | (Shell Komut Yurutme)         |
                                          +-------------------------------+
                                                       |
                                          +-------------------------------+
                                          |   Windows Sistem Komutlari    |
                                          |   (winget, choco CLI)         |
                                          +-------------------------------+
```

---

## 3. Ozellikler ve Gereksinimler

### 3.1 Cekirdek Ozellikler

#### F1: Coklu Kaynak Paket Yonetimi
| Alan | Detay |
|------|-------|
| **Oncelik** | P0 (Kritik) |
| **Durum** | Tamamlandi |
| **Aciklama** | WinGet, Chocolatey ve Microsoft Store paketlerini tek bir arayuzde birlestirme |
| **Kabul Kriterleri** | - Tum kaynaklardan paralel veri cekme <br> - Birlestirmis paket listesi gosterimi <br> - Kaynak bazli filtreleme |

#### F2: Paket Islemleri
| Alan | Detay |
|------|-------|
| **Oncelik** | P0 (Kritik) |
| **Durum** | Tamamlandi |
| **Aciklama** | Paket yukleme, guncelleme ve kaldirma islemleri |
| **Kabul Kriterleri** | - Herhangi bir kaynaktan paket yukleme <br> - Surum secimi destegi <br> - Tek tek veya toplu guncelleme <br> - Onay ile paket kaldirma <br> - Gercek zamanli ilerleme takibi |

#### F3: Kesif ve Arama
| Alan | Detay |
|------|-------|
| **Oncelik** | P0 (Kritik) |
| **Durum** | Tamamlandi |
| **Aciklama** | Tum kaynaklarda paket arama ve kesif sayfasi |
| **Kabul Kriterleri** | - Tum kaynaklarda birlesik arama <br> - Paket detay gorunumu <br> - Surum gecmisi ve secimi <br> - Kategori bazli tarama |

#### F4: Kutuphane Yonetimi
| Alan | Detay |
|------|-------|
| **Oncelik** | P0 (Kritik) |
| **Durum** | Tamamlandi |
| **Aciklama** | Yuklu paketlerin listelenmesi ve yonetimi |
| **Kabul Kriterleri** | - Tum yuklu paketleri goruntuleme <br> - Yuklu ve mevcut surumleri gosterme <br> - Hizli guncelleme/kaldirma erisimi <br> - Sayfalama (5/10/20 oge) |

#### F5: Islem Takibi (Downloads)
| Alan | Detay |
|------|-------|
| **Oncelik** | P1 (Yuksek) |
| **Durum** | Tamamlandi |
| **Aciklama** | Devam eden ve tamamlanmis islemlerin takibi |
| **Kabul Kriterleri** | - Calisir/tamamlanmis islemlerin gercek zamanli gorunumu <br> - Yukleme, guncelleme, kaldirma durumu ve ilerlemesi <br> - Basari/basarisizlik durumu ve hata mesajlari |

#### F6: Kisisellestime
| Alan | Detay |
|------|-------|
| **Oncelik** | P1 (Yuksek) |
| **Durum** | Tamamlandi |
| **Aciklama** | Tema, dil ve gorunum tercihleri |
| **Kabul Kriterleri** | - Moonlight (karanlik) ve Sunlight (aydinlik) tema secimi <br> - Turkce ve Ingilizce dil destegi <br> - Interaktif mod acma/kapama <br> - Tercihler localStorage'da kalici |

#### F7: Akilli Filtreleme
| Alan | Detay |
|------|-------|
| **Oncelik** | P1 (Yuksek) |
| **Durum** | Tamamlandi |
| **Aciklama** | Paketleri kaynak, kategori ve arama ile filtreleme |
| **Kabul Kriterleri** | - Kaynak bazli filtreleme (WinGet, Chocolatey, MS Store, Tumu) <br> - Kategori bazli filtreleme (Gelistirici, Medya, Oyun, Iletisim, Tarayici, Uretkenlik, Araclar, Diger) <br> - Ad veya paket ID ile arama <br> - Sadece guncellemesi olanlari gosterme |

#### F8: Yonetici Durumu Farkindiligi
| Alan | Detay |
|------|-------|
| **Oncelik** | P2 (Orta) |
| **Durum** | Tamamlandi |
| **Aciklama** | Uygulamanin yonetici haklariyla calisip calismadigini kontrol etme |
| **Kabul Kriterleri** | - Yonetici haklari kontrolu <br> - Yonetici degilse uyari gosterimi |

---

### 3.2 Sayfa Yapisi ve Yonlendirme

| Rota | Sayfa | Aciklama |
|------|-------|----------|
| `/` | DiscoverView | Ana sayfa - hero arama, kategori izgarasi, arama sonuclari |
| `/package/:id` | PackageDetailView | Paket detaylari, surumler, islem butonlari |
| `/library` | MyPackagesView | Yuklu paketler kutuphanesi |
| `/downloads` | DownloadsView | Islem takip sayfasi |
| `/settings` | SettingsView | Tema ve dil ayarlari |

---

### 3.3 Komponent Hiyerarsisi

```
AppLayout (Sidebar + Icerik)
|
+-- DiscoverView
|   +-- Hero Search
|   +-- Category Grid
|   +-- Search Results
|
+-- MyPackagesView
|   +-- AppTab (Kaynak filtreleri)
|   +-- PackageCard (Her yuklu paket icin)
|   |   +-- ProgressBar
|   +-- BulkUpdateProgress
|   +-- AppPagination
|
+-- PackageDetailView
|   +-- Paket Bilgileri
|   +-- Surum Gecmisi
|   +-- Islem Butonlari
|
+-- DownloadsView
|   +-- Operation Cards
|   +-- ProgressBar
|
+-- SettingsView
|   +-- ThemeToggle
|   +-- Language Selector
|
+-- Modals
    +-- InstallModal (Arama, kaynak secimi, surum, yukleme)
    +-- ErrorModal (Hata detaylari)
```

---

## 4. State Yonetimi

### 4.1 Store Yapisi

| Store | Sorumluluk |
|-------|------------|
| **packages** | Paket listesi, filtreleme, islemler, toplu guncelleme, arama |
| **app** | Tema, karanlik mod, dil, yonetici durumu |
| **ui** | Konsol logları, modal durumlari, sayfalama |
| **notification** | Bildirimler (basari, hata, uyari, bilgi) - otomatik kapatma |
| **memory** | Kalici kullanici tercihleri (localStorage senkronizasyonu) |

### 4.2 Veri Modelleri

#### Package (Paket)
```typescript
interface Package {
  name: string            // Paket adi
  id: string              // Benzersiz paket ID
  currentVersion: string  // Yuklu surum
  availableVersion: string // Mevcut en son surum
  source: PackageSource   // winget | chocolatey | msstore
  hasUpdate: boolean      // Guncelleme mevcut mu
  category: CategoryType  // Otomatik kategorileme
  publisher?: string      // Yayinci
  description?: string    // Aciklama
  updating?: boolean      // Guncelleme durumunda mi
  progress?: number       // Ilerleme yuzdesi
}
```

#### Operation (Islem)
```typescript
interface Operation {
  id: string
  packageId: string
  packageName: string
  source: PackageSource
  type: 'install' | 'update' | 'uninstall'
  progress: number        // 0-100
  status: 'running' | 'success' | 'error'
  error?: string
  startedAt: number
}
```

---

## 5. Servis Katmani

### 5.1 Paket Saglayici Sistemi (Plugin Mimarisi)

```typescript
interface PackageProvider {
  name: string
  list(): Promise<Package[]>
  search(query: string): Promise<Package[]>
  show(id: string): Promise<PackageDetail>
  install(id: string, version?: string): Promise<void>
  update(id: string): Promise<void>
  uninstall(id: string): Promise<void>
  getVersions(id: string): Promise<string[]>
}
```

| Saglayici | CLI Araci | Durum |
|-----------|-----------|-------|
| WingetProvider | `winget` | Tamamlandi |
| ChocolateyProvider | `choco` | Tamamlandi |
| MSStoreProvider | `winget` (MS Store kaynak filtreli) | Kismi |

### 5.2 IPC Servisi (Tauri Shell)
- Sistem komutlari yurutme
- Komut varlik kontrolu
- Yonetici durumu kontrolu
- Microsoft Store uygulamalarini acma

### 5.3 Komut Olusturucu (Command Builder)
- Sablon bazli guvenli komut olusturma
- Parametre validasyonu (paket ID, arama sorgusu, surum)
- Komut enjeksiyonuna karsi koruma

### 5.4 Onbellek Servisi
- TTL bazli localStorage onbellekleme (varsayilan 6 saat)
- Surum bazli gecersiz kilma
- Yuklu paketler, paket detaylari ve surum listeleri icin

---

## 6. Tema ve Gorunum Sistemi

### 6.1 Mevcut Temalar

| Tema | Tip | Aciklama |
|------|-----|----------|
| **Moonlight** | Karanlik | Koyu mavi arka plan, mavi vurgu rengi (varsayilan) |
| **Sunlight** | Aydinlik | Beyaz arka plan, mavi vurgu rengi |

### 6.2 CSS Degisken Sistemi
- HSL bazli 18 CSS degiskeni
- `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`
- Tailwind entegrasyonu: `hsl(var(--xxx))` sozdizimi
- Sistem tema algilama (media query listener)

---

## 7. Uluslararasilastirma (i18n)

| Dil | Kod | Durum |
|-----|-----|-------|
| Turkce | `tr` | Tamamlandi (varsayilan) |
| Ingilizce | `en` | Tamamlandi |

**Mesaj Organizasyonu:**
- `app.*` - Uygulama geneli (ayarlar, tema, navigasyon)
- `package.*` - Paket islemleri, kategoriler, filtreler
- `modal.*` - Modal diyaloglar (yukleme, onay)
- `downloads.*` - Islem takip mesajlari

---

## 8. Guvenlik Gereksinimleri

| Gereksinim | Uygulama |
|------------|----------|
| **Komut Enjeksiyonu Onleme** | CommandBuilder ile sablon bazli komut olusturma |
| **Parametre Validasyonu** | Paket ID, arama sorgusu ve surum icin dogrulama kurallari |
| **Yonetici Hakki Kontrolu** | Islem oncesi yetki dogrulamasi |
| **Guvenli IPC** | Tauri shell plugin ile kontrollü komut yurutme |

---

## 9. Performans Gereksinimleri

| Metrik | Hedef |
|--------|-------|
| **Ilk Yukleme Suresi** | < 3 saniye |
| **Paket Listesi Getirme** | < 10 saniye (paralel cekme) |
| **Arama Yanit Suresi** | < 5 saniye |
| **Bellek Kullanimi** | < 150 MB (Tauri avantaji) |
| **Onbellek Gecerlilik Suresi** | 6 saat (yapilandirılabilir) |

---

## 10. Dagitim ve Surum Yonetimi

### 10.1 Build ve Dagitim
- **Build:** `pnpm run tauri build` ile MSI/EXE olusturma
- **CI/CD:** GitHub Actions ile otomatik build (tag push tetiklemeli)
- **Dagitim:** GitHub Releases sayfasi

### 10.2 Surum Guncellenmesi Gereken Dosyalar
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `package.json`

### 10.3 Sistem Gereksinimleri
| Gereksinim | Minimum |
|------------|---------|
| **Isletim Sistemi** | Windows 10/11 |
| **Gelistirme - Node.js** | 18+ |
| **Gelistirme - Rust** | Guncel stabil surum |
| **WinGet** | Windows 10/11 yerlesik |
| **Chocolatey** | Opsiyonel |

---

## 11. Gelecek Yol Haritasi (Potansiyel Ozellikler)

| Oncelik | Ozellik | Aciklama |
|---------|---------|----------|
| P1 | **Otomatik Guncelleme** | Zamanlayici ile arka planda otomatik paket guncelleme |
| P1 | **Paket Gruplari** | Gelistirme ortami sablonlari (orn. "Web Gelistirici Paketi") |
| P2 | **Disa/Ice Aktarma** | Yuklu paket listesini disa aktarma ve baska makinede iceye aktarma |
| P2 | **Guncelleme Bildirimleri** | Sistem tepsisi bildirimleri ile guncelleme hatirlatmalari |
| P2 | **Kullanici Degerlendirmeleri** | Topluluk bazli paket puanlama ve yorumlama |
| P3 | **Ek Paket Yoneticileri** | Scoop, npm (global), pip (global) gibi ek kaynak destegi |
| P3 | **Uzaktan Yonetim** | Birden fazla makineyi tek noktadan yonetme |
| P3 | **Paket Karsilastirma** | Benzer paketleri yan yana karsilastirma |

---

## 12. Basari Metrikleri (KPI)

| Metrik | Hedef |
|--------|-------|
| **Aylik Aktif Kullanici** | 1,000+ (ilk 6 ay) |
| **GitHub Stars** | 500+ (ilk yil) |
| **Ortalama Oturum Suresi** | > 3 dakika |
| **Islem Basari Orani** | > %95 |
| **Kullanici Memnuniyeti** | > 4.0/5.0 |
| **Hata Bildirimi Cozum Suresi** | < 7 gun |

---

## 13. Riskler ve Azaltma Stratejileri

| Risk | Etki | Olasilik | Azaltma |
|------|------|----------|---------|
| WinGet/Choco CLI degisiklikleri | Yuksek | Orta | Saglayici soyutlama katmani, duzenli test |
| Yonetici hakki gereksinimleri | Orta | Yuksek | Kullaniciya net uyari, dokumasyon |
| Buyuk paket listeleri performansi | Orta | Orta | Sayfalama, onbellek, sanal kaydirma |
| Windows surum uyumsuzlugu | Dusuk | Dusuk | CI/CD'de coklu Windows surum testi |

---

*Bu dokuman, Win-Package-UI projesinin mevcut durumunu ve gelecek planlarini yansitmaktadir. Dokuman, proje gelistikce guncellenmelidir.*
