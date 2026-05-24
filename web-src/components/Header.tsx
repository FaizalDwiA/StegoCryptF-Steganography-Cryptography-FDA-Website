/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Binary, ShieldCheck, HelpCircle } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header id="app-header" className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Binary id="logo-icon" className="w-5 h-5 stroke-[2.25]" />
          </div>
          <div>
            <h1 id="app-title" className="text-xl font-sans font-bold tracking-tight text-white flex flex-col sm:flex-row sm:items-start sm:items-center gap-1.5 sm:gap-2">
              StegoCryptF <span className="w-fit text-[9px] sm:text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono font-semibold">Steganography Cryptography FDA</span>
            </h1>
            <p id="app-subtitle" className="text-xs text-zinc-400 mt-1 sm:mt-0">
              Sembunyikan pesan rahasia di dalam pixel gambar secara 100% aman & client-side
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <nav id="app-navigation" className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-full md:w-auto overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            id="tab-encode"
            onClick={() => setActiveTab("encode")}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === "encode"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Sembunyikan (Encode)
          </button>
          <button
            id="tab-decode"
            onClick={() => setActiveTab("decode")}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === "decode"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <Binary className="w-3.5 h-3.5 text-blue-400" />
            Ekstrak (Decode)
          </button>
          <button
            id="tab-info"
            onClick={() => setActiveTab("info")}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === "info"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            Panduan Edukasi
          </button>
        </nav>
      </div>
    </header>
  );
}
