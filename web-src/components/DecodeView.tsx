/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileImage, ShieldAlert, Key, Eye, EyeOff, Sparkles, Clipboard, Check, RefreshCw } from "lucide-react";
import { extractPayload, bytesToString, decryptMessage } from "../utils/stego";

export default function DecodeView() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [extractedMessage, setExtractedMessage] = useState("");

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process dropped file
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  // Process file pick
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("File yang diunggah harus berupa tipe gambar.");
      return;
    }

    setError(null);
    setImageFile(file);
    setSuccess(false);
    setExtractedMessage("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);

      // Extract image dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Core extraction action
  const handleDecode = () => {
    if (!imagePreview) {
      setError("Silakan unggah stego-gambar terlebih dahulu.");
      return;
    }

    setError(null);
    setLoading(true);
    setSuccess(false);
    setExtractedMessage("");

    try {
      // Load source preview to canvas
      const img = new Image();
      img.src = imagePreview;
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Gagal menginisialisasi HTML5 Canvas Context.");
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const stegoImageData = ctx.getImageData(0, 0, img.width, img.height);
          
          // 1. Recover payload from pixel LSB bytes
          const rawBytes = extractPayload(stegoImageData);
          const recoveredText = bytesToString(rawBytes);

          // 2. Decrypt if passphrase provided
          let finalMessage = recoveredText;
          if (passphrase) {
            finalMessage = decryptMessage(recoveredText, passphrase);
          } else {
            // Check if recovered text looks like Crypto-JS AES ciphertext, e.g. starts with "U2FsdGVkX1"
            if (recoveredText.startsWith("U2FsdGVkX1")) {
              throw new Error("Pesan ini terenkripsi. Silakan masukkan kata sandi yang benar untuk dekripsi.");
            }
          }

          setExtractedMessage(finalMessage);
          setSuccess(true);
          setLoading(false);
        } catch (err: any) {
          setError(err.message || "Gagal mengekstrak pesan.");
          setLoading(false);
        }
      };
      img.onerror = () => {
        setError("Gagal memuat visual gambar.");
        setLoading(false);
      };
    } catch (err: any) {
      setError(err.message || "Proses pembacaan bit gagal.");
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!extractedMessage) return;
    navigator.clipboard.writeText(extractedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageDimensions(null);
    setPassphrase("");
    setError(null);
    setSuccess(false);
    setExtractedMessage("");
  };

  return (
    <div id="decode-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in py-2">
      {/* Upload Region & Params (Left) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-zinc-900 border border-zinc-805 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-500" /> Unggah Stego-Gambar
            </h3>
            {imageFile && (
              <button
                id="reset-decode-btn"
                onClick={handleReset}
                className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-mono cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Bersihkan
              </button>
            )}
          </div>

          {!imagePreview ? (
            /* Drag and Drop Zone */
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3.5 cursor-pointer min-h-[220px] text-center transition-all duration-300 ${
                dragActive
                  ? "border-blue-500 bg-blue-500/5 shadow-inner"
                  : "border-zinc-850 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-950/60"
              }`}
            >
              <input
                id="decode-file-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-3.5 bg-zinc-900 rounded-2xl border border-zinc-805 text-blue-500 shadow-md">
                <FileImage className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-200">
                  Tarik & lepas stego-gambar (PNG) di sini
                </p>
                <p className="text-[11px] text-zinc-500">
                  atau klik untuk menelusuri dari folder lokal
                </p>
              </div>
            </div>
          ) : (
            /* Image Preview Card */
            <div className="space-y-4">
              <div className="relative border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 flex justify-center items-center min-h-[220px] max-h-[340px]">
                <img
                  src={imagePreview}
                  alt="Stego source file preview"
                  referrerPolicy="no-referrer"
                  className="max-h-[340px] max-w-full object-contain"
                />
              </div>

              {/* Info Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl space-y-0.5">
                  <span className="text-zinc-505 block text-[10px]">NAMA FILE:</span>
                  <span className="text-zinc-300 font-semibold truncate block max-w-full">{imageFile?.name}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl space-y-0.5">
                  <span className="text-zinc-550 block text-[10px]">DIMENSI PIKSEL:</span>
                  <span className="text-zinc-300 font-semibold">
                    {imageDimensions ? `${imageDimensions.width} × ${imageDimensions.height} px` : "Sedang mengukur..."}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cryptography AES Passphrase Input */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label id="label-passphrase-decode" className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-500" /> Kata Sandi Dekripsi
              </label>
              <span className="text-[10px] text-zinc-500 font-mono font-semibold">Wajib jika stego terenkripsi</span>
            </div>
            <div className="relative">
              <input
                id="decode-passphrase-input"
                type={showPassphrase ? "text" : "password"}
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  setSuccess(false);
                  setExtractedMessage("");
                }}
                placeholder="Masukkan kata sandi dekripsi..."
                className="w-full pl-4 pr-11 py-2.5 bg-zinc-950 border border-zinc-805 rounded-xl text-zinc-100 text-xs placeholder-zinc-650 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassphrase(!showPassphrase)}
                className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3.5 bg-red-500/5 border border-red-500/20 text-xs text-red-400 rounded-xl flex gap-2.5 items-start">
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Extract Button */}
          <button
            id="decode-action-btn"
            onClick={handleDecode}
            disabled={loading || !imagePreview}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
              loading 
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                : !imagePreview
                ? "bg-zinc-800/50 text-zinc-500 border border-zinc-800/80 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 cursor-pointer"
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Mengekstrak Pesan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Ekstrak & Baca Pesan Tersembunyi
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Results Drawer (Right) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 min-h-[300px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" /> Hasil Ekstraksi
              </h3>
              {success && extractedMessage && (
                <button
                  id="copy-to-clipboard-btn"
                  onClick={handleCopyToClipboard}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                    copied
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5" />
                      Salin Teks
                    </>
                  )}
                </button>
              )}
            </div>

            {success && extractedMessage ? (
              <div className="mt-4 space-y-4">
                <div className="bg-emerald-500/5 border border-emerald-500/20 px-3 py-2 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Pesan rahasia berhasil dipulihkan ({extractedMessage.length} karakter)
                </div>

                <div className="relative">
                  <textarea
                    id="extracted-message-output"
                    readOnly
                    value={extractedMessage}
                    rows={10}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono leading-relaxed resize-none focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-zinc-500 space-y-3 flex-grow">
                <div className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-full">
                  <Key className="w-8 h-8 text-zinc-700 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400">Belum Ada Hasil Ekstraksi</p>
                  <p className="text-[11px] text-zinc-650 max-w-xs leading-relaxed font-sans">
                    Unggah stego-gambar di sebelah kiri, masukkan sandi aslinya (jika dienkripsi), lalu pilih tombol ekstrak.
                  </p>
                </div>
              </div>
            )}
          </div>

          {success && extractedMessage && (
            <div className="text-[10px] text-zinc-500 font-sans tracking-wide border-t border-zinc-800/60 pt-3 text-center">
              Lindungi kerahasiaan data ini. Setelah selesai menyalin, bersihkan kembali layar Anda demi keamanan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
