/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, FileImage, Cpu, AlertTriangle, Key } from "lucide-react";

export default function InfoSection() {
  return (
    <section id="info-section" className="space-y-8 animate-fade-in py-2">
      {/* Intro Hero banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-805 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -tr-y-12 tr-x-12 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 tr-y-12 -tr-x-12 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            Konsep Keamanan Siber (Cybersecurity)
          </div>
          <h2 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-white animate-fade-in">
            Memahami Steganografi LSB & Kriptografi
          </h2>
          <p className="text-zinc-400 text-sm max-w-3xl leading-relaxed">
            Dua cabang utama dalam perlindungan data adalah <strong className="text-zinc-200 font-semibold">Kriptografi</strong> (menyembunyikan <em>arti</em> pesan) dan <strong className="text-zinc-200 font-semibold">Steganografi</strong> (menyembunyikan <em>kehadiran</em> pesan). Aplikasi ini menggabungkan keduanya demi memberikan perlindungan berlapis yang superior.
          </p>
        </div>
      </div>

      {/* Grid: 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LSB Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700/80 transition-all duration-300 flex flex-col gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-11 h-11 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-sans">
            Algoritma LSB (Least Significant Bit)
          </h3>
          <p className="text-zinc-400 text-xs leading-relaxed flex-grow">
            Setiap piksel gambar digital dibentuk dari warna Red (R), Green (G), Blue (B), dan Alpha (A). Masing-masing nilai warna direpresentasikan oleh 1 byte (8 bit, nilai 0-255). Metode LSB mengganti bit paling kanan (bit ke-0) dari komponen RGB dengan bit pesan rahasia kita. Perubahan nilai warna ini maksimal hanya sebesar 1 unit (0,39% dari total warna), menjadikannya mustahil dideteksi secara visual oleh mata manusia.
          </p>
        </div>

        {/* AES Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700/80 transition-all duration-300 flex flex-col gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-11 h-11 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-sans">
            Enkripsi Ganda (AES-256)
          </h3>
          <p className="text-zinc-400 text-xs leading-relaxed flex-grow">
            steganografi murni rentan jika penyerang (analis) mengetahui algoritma penyisipan yang digunakan. Karena itu, aplikasi ini menawarkan integrasi <strong className="text-zinc-200 font-semibold">AES (Advanced Encryption Standard)</strong>. Pesan dienkripsi terlebih dahulu menjadi teks acak menggunakan kunci sandi Anda sebelum disisipkan. Bahkan jika file stego dianaliasi (steganalisis), pembaca tidak akan mengetahui isi pesan aslinya tanpa sandi yang tepat.
          </p>
        </div>

        {/* Lossless Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700/80 transition-all duration-300 flex flex-col gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl w-11 h-11 flex items-center justify-center">
            <FileImage className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-sans">
            Kompresi Lossless (PNG)
          </h3>
          <p className="text-zinc-400 text-xs leading-relaxed flex-grow">
            Format gambar seperti JPEG menggunakan kompresi <em>lossy</em> (pemotongan data) untuk memperkecil ukuran file, yang dapat mengubah nilai-nilai pixel saat disimpan ulang. Ini akan merusak data pesan yang tersimpan di LSB. Format <strong className="text-zinc-200 font-semibold">PNG (Portable Network Graphics)</strong> menggunakan algoritma kompresi <em>lossless</em> yang mempertahankan piksel demi piksel secara eksak, sehingga data LSB tetap aman 100%.
          </p>
        </div>
      </div>

      {/* Visual Bit Demonstration */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2 pb-2 border-b border-zinc-800">
          <Cpu className="w-4 h-4 text-blue-400" /> Ilustrasi Penyisipan Bit LSB
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Bit breakdown */}
          <div className="space-y-4 font-mono text-xs text-zinc-300">
            <div className="border border-zinc-800 p-3 bg-zinc-950 rounded-lg">
              <span className="text-blue-400 font-bold block mb-1">Piksel Asli (RGB)</span>
              <p>Red:   1001011<span className="text-amber-500 underline font-bold">0</span> (150)</p>
              <p>Green: 0101110<span className="text-amber-500 underline font-bold">1</span> (93)</p>
              <p>Blue:  1100010<span className="text-amber-500 underline font-bold">0</span> (196)</p>
            </div>
            
            <div className="p-3 bg-zinc-950 border border-dashed border-zinc-800 rounded-lg text-zinc-400">
              <span className="text-white font-semibold block mb-1">Pesan Rahasia ke Biner:</span>
              <p>Karakter <span className="text-white">"A"</span> = ASCII <span className="text-white">65</span> = Biner <span className="text-blue-400 font-bold">01000001</span></p>
            </div>

            <div className="border border-blue-500/20 p-3 bg-blue-950/10 rounded-lg">
              <span className="text-blue-400 font-bold block mb-1">Piksel Stego (Setelah LSB Disisipi)</span>
              <p>Red:   1001011<span className="text-blue-400 font-bold underline">0</span> (150) <span className="text-zinc-500 text-[10px]">(bit ke-1 pesan)</span></p>
              <p>Green: 0101110<span className="text-blue-400 font-bold underline">1</span> (93) <span className="text-zinc-500 text-[10px]">(bit ke-2 pesan)</span></p>
              <p>Blue:  1100010<span className="text-blue-400 font-bold underline">0</span> (196) <span className="text-zinc-500 text-[10px]">(bit ke-3 pesan)</span></p>
            </div>
          </div>

          <div className="text-xs text-zinc-400 leading-relaxed bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
            <h4 className="font-semibold text-zinc-200">Mengapa Perubahannya Tidak Terlihat?</h4>
            <p>
              Perubahan pixel hanya terjadi pada nilai biner terendah (LSB). Bayangkan warna Red yang senilai 150 berubah menjadi 151, atau Green senilai 93 berubah menjadi 92. 
            </p>
            <p>
              Karena monitor modern menampilkan jutaan variasi warna, mata manusia biasa tidak bisa mendeteksi perbedaan halus satu tingkat ini. Secara visual, gambar stego akan terlihat <strong>100% identik</strong> dengan gambar aslinya.
            </p>
          </div>
        </div>
      </div>

      {/* Critical rules list (Indonesian) */}
      <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-6 flex flex-col md:flex-row gap-5">
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl h-fit w-fit">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-zinc-200 font-sans">
            Aturan & Batasan Penting dalam Penggunaan Steganografi Gambar
          </h4>
          <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-2 leading-relaxed">
            <li>
              <strong className="text-zinc-300">Jangan Kompres atau Resize Gambar:</strong> Aplikasi perpesanan instan seperti WhatsApp, Telegram (kecuali dikirim sebagai file asli), Instagram, atau Facebook akan secara otomatis mengompresi gambar untuk menghemat bandwidth. Kompresi ini merusak pixel LSB. Kirim gambar stego Anda sebagai <em className="text-blue-400 font-bold font-mono">dokumen / file asli</em> demi menjaga isi pesannya.
            </li>
            <li>
              <strong className="text-zinc-300">Format Wajib PNG:</strong> Selalu simpan gambar dalam format PNG hasil unduhan dari aplikasi ini. Konversi ke JPG atau WebP akan secara langsung menghancurkan pesan rahasia yang tertanam di dalamnya.
            </li>
            <li>
              <strong className="text-zinc-300">Ingat Kata Sandi:</strong> Apabila menyisipkan pesan menggunakan kata sandi/passphrase, Anda mutlak harus membagikan kata sandi tersebut dengan sang penerima. Kriptografi AES-256 yang kami gunakan tidak dapat di-crack atau dibobol tanpa kunci sandi yang tepat.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
