/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import Header from "./components/Header";
import EncodeView from "./components/EncodeView";
import DecodeView from "./components/DecodeView";
import InfoSection from "./components/InfoSection";
import { ShieldAlert, Binary, Sparkles, HelpCircle } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("encode");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Dynamic Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome message / Tab Intro banner */}
        <div id="welcome-banner" className="mb-8 border border-zinc-800 bg-zinc-900/60 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 id="view-title" className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-2">
              {activeTab === "encode" && (
                <>
                  <Sparkles className="w-4 h-4 text-blue-400" /> Sembunyikan Pesan Rahasia (Pixel-LSB Enkapsulasi)
                </>
              )}
              {activeTab === "decode" && (
                <>
                  <Binary className="w-4 h-4 text-blue-400" /> Ekstraksi & Dekripsi Data Biner LSB
                </>
              )}
              {activeTab === "info" && (
                <>
                  <HelpCircle className="w-4 h-4 text-blue-400" /> Panduan & Konsep Keamanan Steganografi
                </>
              )}
            </h2>
            <p id="view-description" className="text-xs text-zinc-400 font-sans">
              {activeTab === "encode" && "Sisipkan teks penting atau kata sandi terenkripsi langsung ke dalam bit-bit warna gambar secara kasat mata."}
              {activeTab === "decode" && "Pindai data biner LSB pada gambar stego untuk memulihkan pesan orisinal dengan cepat."}
              {activeTab === "info" && "Pelajari struktur biner LSB, integritas format lossless PNG, dan teknik analisis kriptografi ganda."}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl w-fit text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] text-zinc-400">ENGINE STATUS: ACTIVE</span>
          </div>
        </div>

        {/* Render Active View */}
        <div id="tab-content-container">
          {activeTab === "encode" && <EncodeView />}
          {activeTab === "decode" && <DecodeView />}
          {activeTab === "info" && <InfoSection />}
        </div>
      </main>

      {/* Modern Compact Footer */}
      <footer id="app-footer" className="border-t border-zinc-900 bg-zinc-950/40 py-6 mt-12 text-center text-xs text-zinc-500 space-y-1">
        <p className="flex items-center justify-center gap-1">
          STEGOCRYPTF — Steganography Cryptography FDA.
        </p>
        <p className="font-mono text-[10px] text-zinc-600">
          Proses dilakukan 100% pada peramban Anda. Tidak ada data piksel atau berkas yang diunggah ke server pihak ketiga mana pun.
        </p>
      </footer>
    </div>
  );
}

