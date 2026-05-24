# StegoCryptF (Steganography Cryptography FDA)

Aplikasi berbasis web modern, interaktif, dan berkinerja tinggi untuk teknik steganografi **Least Significant Bit (LSB)** yang berjalan **100% di sisi klien (client-side)**. Sistem ini memungkinkan pengguna menyisipkan pesan rahasia langsung ke dalam pixel-pixel warna gambar tanpa merubah visualisasi luar gambar secara kasat mata, serta mengekstraknya kembali secara presisi. 

Untuk keamanan tingkat tinggi, **StegoCryptF** mengawinkan steganografi dengan **kriptografi AES-256**, ditambah dengan fitur **Auto-Konversi Lossless PNG secara Real-time** saat pengunggahan gambar.

---

## 🛡️ Konsep Keamanan & Deskripsi Teknis

### 1. Steganografi LSB (Least Significant Bit)
Gambar digital direpresentasikan oleh ribuan piksel, di mana masing-masing piksel memiliki 3 saluran warna dasar: **Red (Merah)**, **Green (Hijau)**, dan **Blue (Biru)**. Nilai intensitas warna masing-masing saluran disimpan dalam 1 byte (8 bit, nilai 0 hingga 255).
Nilai bit paling kanan (bit ke-0) disebut sebagai **Least Significant Bit (LSB)** yang berkontribusi paling kecil terhadap pembentukan intensitas warna sebenarnya.
- Algoritma kami mengganti bit LSB ini dengan bit dari rangkaian pesan rahasia kita.
- Perubahan nilai biner ini hanya menggeser warna maksimal sebesar 1 unit (0,39% dari total gradasi warna).
- Perubahan mikro ini **tidak akan terbaca oleh mata manusia** dan visual gambar terlihat 100% utuh.

### 2. Kriptografi AES-256 (Advanced Encryption Standard)
Jika penyerang mengetahui pola ekstraksi LSB, mereka dapat mengurai pesan rahasia Anda. Di sinilah kami mengintegrasikan enkripsi simetris **AES-256** menggunakan library **Crypto-JS**.
- Sebelum bits disisipkan, jika pengguna menentukan kata kunci sandi (passphrase), teks orisinal diubah menjadi ciphertext Base64 acak.
- Tanpa kata sandi yang tepat, analis forensik gambar tidak akan bisa memahami pesan rahasia di dalam biner LSB, menciptakan perlindungan sandi berlapis ganda.

### 3. Integritas Data & Format Lossless (PNG)
- **Mengapa wajib menggunakan format PNG?** PNG merupakan format penyimpanan gambar dengan kompresi *lossless* (tanpa kehilangan bit demi bit pixel saat disimpan). 
- **Mengapa JPEG merusak steganografi LSB?** JPEG mengandalkan kompresi *lossy* yang mereorganisasi nilai matrik pixel ketika disimpan untuk memadatkan file. Penyusunan ulang ini akan mengubah biner LSB, menyebabkan kegagalan pembacaan pesan saat diekstrak.

---

## 🚀 Fitur Utama & Keunggulan

- **100% Client-Side:** Seluruh manipulasi piksel (`getImageData` & `putImageData` Canvas API) serta enkripsi dilakukan langsung di peramban (browser) Anda. File tidak pernah dikirim ke server luar guna menjaga privasi mutlak.
- **Auto-Konversi Lossless PNG:** Pengguna disarankan menggunakan format PNG. Namun, jika pengguna mengunggah gambar format lain (seperti JPEG, JPG, WebP, GIF, BMP), sistem secara otomatis mengonversinya menjadi **PNG Lossless** secara *on-the-fly* di memori menggunakan HTML5 Canvas, sehingga enkripsi piksel LSB tetap andal tanpa perlu konversi manual.
- **Visualisasi Kapasitas Real-time:** Menampilkan perbandingan panjang byte string dengan ketersediaan jumlah pixel gambar lengkap dengan indikator progress status yang interaktif.
- **Enkripsi AES-256 Opsional:** Mengamankan isi catatan penting menggunakan frasa sandi rahasia sebelum proses penyisipan biner piksel dilakukan.
- **Ekstraksi One-Click:** Cukup seret gambar stego ke zona unggah, isikan kata sandi (bila ada), dan dapatkan pesan aslinya dalam waktu singkat.
- **UI Responsif & Slate Aesthetic:** Desain futuristik bergaya gelap yang nyaman dipandang (eye-safe slate dark mode) serta ramah digunakan di desktop maupun perangkat seluler.

---

## 📂 Struktur Direktori Proyek

Proyek ini telah direorganisasi agar file pengembangan dan file hasil kompilasi (build) terpisah dengan rapi:

*   📁 **`web-src/`**: Folder utama kode sumber pengembangan (*development source code*), yang berisi:
    *   `index.html`: File entry point HTML pengembangan.
    *   `main.tsx`: Entry point React TypeScript.
    *   `App.tsx`: Lay-out utama dan komponen root aplikasi.
    *   `components/`: Folder komponen UI React (Header, EncodeView, DecodeView, dll).
    *   `utils/`: Logika steganografi LSB dan utilitas enkripsi.
*   📁 **Root Folder ( `./` )**: Tempat disajikannya file hasil kompilasi produksi (`assets/` dan `index.html` produksi) setelah menjalankan script build. 
*   **`.gitignore`**: Dikonfigurasi secara otomatis untuk mengabaikan `/assets/` dan `/index.html` hasil kompilasi di tingkat root agar repositori Git Anda tetap bersih dari file build.

---

## 📦 Panduan Instalasi & Pengembangan Lokal

Prasyarat: Pastikan perangkat Anda sudah terpasang **Node.js (versi 18+)** dan pengelola paket **npm**.

### 1. Kloning Proyek & Instalasi Dependensi
Jalankan perintah berikut di dalam terminal kerja Anda:
```bash
# Mengunduh paket modul yang dibutuhkan
npm install
```

### 2. Jalankan Mode Pengembangan (Local Dev Server)
Untuk menguji coba jalannya web aplikasi secara interaktif dengan auto-reload (menjalankan file dari folder `web-src/`):
```bash
# Menjalankan Vite development server
npm run dev
```
Buka aplikasi di browser Anda di alamat default: `http://localhost:3000`.

---

## 🛠️ Panduan Build Klien Produksi

Untuk mengompilasi aplikasi ini ke dalam bundel kode statis siap pakai yang akan langsung ditempatkan di root direktori (bukan folder `dist`):

```bash
# Memulai kompilasi Vite untuk produksi
npm run build
```

Hasil kompilasi file statis berupa berkas HTML (`index.html`) dan folder aset (`assets/`) berisi JS/CSS terkompresi akan diletakkan langsung di **direktori root** proyek Anda.

### 🧹 Membersihkan Hasil Build
Jika Anda ingin membersihkan file hasil kompilasi produksi dari direktori root:
```bash
npm run clean
```
Perintah ini akan secara aman menghapus folder `assets/` dan `index.html` hasil build di tingkat root tanpa menyentuh source code utama Anda di folder `web-src/`.
