/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileImage, ShieldAlert, Key, Eye, EyeOff, Sparkles, Download, CheckSquare, RefreshCw } from "lucide-react";
import { getMessageCapacity, stringToBytes, encryptMessage, embedPayload } from "../utils/stego";

export default function EncodeView() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [secretMessage, setSecretMessage] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stegoImageURL, setStegoImageURL] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed Values
  const maxCapacityBytes = imageDimensions 
    ? getMessageCapacity(imageDimensions.width, imageDimensions.height)
    : 0;
  
  // Calculate raw byte size of the message once typed (and potentially encrypted if passphrase is provided)
  const getPayloadSize = () => {
    if (!secretMessage) return 0;
    try {
      if (passphrase) {
        // Approximate cipher size
        const encrypted = encryptMessage(secretMessage, passphrase);
        return stringToBytes(encrypted).length;
      }
      return stringToBytes(secretMessage).length;
    } catch {
      return stringToBytes(secretMessage).length;
    }
  };

  const payloadSize = getPayloadSize();
  const percentageUsed = maxCapacityBytes > 0 
    ? Math.min(100, (payloadSize / maxCapacityBytes) * 100)
    : 0;

  const isCapacityExceeded = payloadSize > maxCapacityBytes;

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

    setSuccess(false);
    setStegoImageURL(null);
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Gagal menginisialisasi HTML5 Canvas.");
          }

          ctx.drawImage(img, 0, 0);

          // Convert to lossless PNG data URL for preview
          const pngDataUrl = canvas.toDataURL("image/png");
          setImagePreview(pngDataUrl);
          setImageDimensions({ width: img.width, height: img.height });

          // Re-create as a PNG File object
          const originalName = file.name.replace(/\.[^/.]+$/, "");
          const pngFileName = `${originalName}.png`;

          canvas.toBlob((blob) => {
            if (blob) {
              const convertedFile = new File([blob], pngFileName, { type: "image/png" });
              setImageFile(convertedFile);

              if (file.type !== "image/png") {
                setInfoMessage(
                  `Gambar ${file.type.split("/")[1].toUpperCase()} berhasil dikonversi secara otomatis ke format PNG Lossless.`
                );
              } else {
                setInfoMessage(null);
              }
            } else {
              setImageFile(file);
            }
            setLoading(false);
          }, "image/png");
        } catch (err: any) {
          setError("Gagal memproses dan mengonversi gambar ke PNG.");
          setLoading(false);
        }
      };
      img.onerror = () => {
        setError("Gagal memuat visual gambar.");
        setLoading(false);
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setError("Gagal membaca file gambar.");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Core insertion action
  const handleEncode = () => {
    if (!imagePreview || !imageFile) {
      setError("Silakan unggah gambar terlebih dahulu.");
      return;
    }
    if (!secretMessage) {
      setError("Pesan rahasia tidak boleh kosong.");
      return;
    }
    if (isCapacityExceeded) {
      setError("Kapasitas penyimpanan data pada gambar terlampaui.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1. Prepare message payload (encrypt if password exists)
      const finalMessage = passphrase ? encryptMessage(secretMessage, passphrase) : secretMessage;
      const payloadBytes = stringToBytes(finalMessage);

      // 2. Load preview into image element to draw on canvas
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

          const originalImageData = ctx.getImageData(0, 0, img.width, img.height);
          
          // 3. Apply Least Significant Bit stego algorithm
          const stegoImageData = embedPayload(originalImageData, payloadBytes);

          // 4. Paint modified pixels back onto canvas
          ctx.putImageData(stegoImageData, 0, 0);

          // 5. Output canvas as pure lossless PNG Data URL
          const stegoUrl = canvas.toDataURL("image/png");
          setStegoImageURL(stegoUrl);
          setSuccess(true);
          setLoading(false);
        } catch (err: any) {
          setError(err.message || "Gagal menyembunyikan pesan ke dalam gambar.");
          setLoading(false);
        }
      };
      img.onerror = () => {
        setError("Gagal memuat visual gambar.");
        setLoading(false);
      };
    } catch (err: any) {
      setError(err.message || "Gagal memproses sandi enkripsi.");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageDimensions(null);
    setSecretMessage("");
    setPassphrase("");
    setError(null);
    setInfoMessage(null);
    setSuccess(false);
    setStegoImageURL(null);
  };

  return (
    <div id="encode-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in py-2">
      {/* Settings / Inputs Form (Left) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" /> Pengaturan Enkode
            </h3>
            {imageFile && (
              <button
                id="reset-encode-btn"
                onClick={handleReset}
                className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-mono cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Bersihkan
              </button>
            )}
          </div>

          {/* Steganography Secret message input */}
          <div className="space-y-2">
            <label id="label-secret-message" className="block text-xs font-semibold text-zinc-400">
              Pesan Rahasia yang Ingin Disembunyikan <span className="text-red-400">*</span>
            </label>
            <textarea
              id="secret-message-input"
              rows={5}
              value={secretMessage}
              onChange={(e) => {
                setSecretMessage(e.target.value);
                setSuccess(false);
                setStegoImageURL(null);
              }}
              placeholder="Masukkan pesan penting, kredensial, kunci API, atau catatan rahasia di sini secara aman..."
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-100 text-xs placeholder-zinc-650 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono leading-relaxed resize-none"
            />
          </div>

          {/* Cryptography AES Passphrase */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label id="label-passphrase" className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" /> Kata Sandi Enkripsi (Opsional)
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">Lapisan Kriptografi AES-256</span>
            </div>
            <div className="relative">
              <input
                id="encode-passphrase-input"
                type={showPassphrase ? "text" : "password"}
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  setSuccess(false);
                  setStegoImageURL(null);
                }}
                placeholder="Buat sandi enkripsi jika ingin mengamankan pesan menggunakan sandi..."
                className="w-full pl-4 pr-11 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-100 text-xs placeholder-zinc-650 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
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

          {/* Capacity gauge based on chosen image */}
          {imageDimensions && (
            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Kapasitas Maksimal Gambar:</span>
                <span className="font-mono text-white font-semibold">
                  {maxCapacityBytes.toLocaleString()} karakter (bytes)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Ukuran Payload Saat Ini:</span>
                <span className={`font-mono font-bold ${isCapacityExceeded ? "text-red-400" : "text-emerald-400"}`}>
                  {payloadSize.toLocaleString()} bytes
                </span>
              </div>

              {/* Progress Slider Track */}
              <div className="space-y-1.5">
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden block">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCapacityExceeded 
                        ? "bg-red-500" 
                        : percentageUsed > 80 
                        ? "bg-amber-500" 
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${percentageUsed}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                  <span>0%</span>
                  <span>{percentageUsed.toFixed(1)}% Terpakai</span>
                  <span>100%</span>
                </div>
              </div>

              {isCapacityExceeded && (
                <div className="flex gap-2 text-[11px] text-red-400 bg-red-500/5 border border-red-500/20 p-2.5 rounded-lg leading-relaxed animate-fade-in">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <p>Ukuran pesan melebihi kapasitas piksel yang tersedia pada gambar ini. Kurangi teks atau gunakan dimensi gambar yang lebih besar.</p>
                </div>
              )}
            </div>
          )}

          {/* Error Message Box */}
          {error && (
            <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 rounded-xl flex gap-2.5 items-start">
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Info Message Box */}
          {infoMessage && (
            <div className="p-3.5 bg-blue-500/5 border border-blue-500/20 text-xs text-blue-300 rounded-xl flex gap-2.5 items-start animate-fade-in">
              <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
              <p className="leading-relaxed">{infoMessage}</p>
            </div>
          )}

          {/* Action Button */}
          <button
            id="encode-action-btn"
            onClick={handleEncode}
            disabled={loading || !imageFile || !secretMessage || isCapacityExceeded}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
              loading 
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                : !imageFile || !secretMessage || isCapacityExceeded
                ? "bg-zinc-800/50 text-zinc-500 border border-zinc-800/80 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 cursor-pointer"
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sedang Menyisipkan Pesan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Sembunyikan Pesan dalam Gambar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Workspace Area (Right) */}
      <div className="lg:col-span-6 space-y-6">
        {/* Upload Region */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2 pb-3 border-b border-zinc-800">
            <FileImage className="w-4 h-4 text-blue-500" /> Workspace Gambar
          </h3>

          {!imagePreview ? (
            /* Drag and Drop Zone */
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3.5 cursor-pointer min-h-[280px] text-center transition-all duration-300 ${
                dragActive
                  ? "border-blue-500 bg-blue-500/5 shadow-inner"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-950/60"
              }`}
            >
              <input
                id="encode-file-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-3.5 bg-zinc-900 rounded-2xl border border-zinc-800 text-blue-500 shadow-md">
                <UploadCloud className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-200">
                  Tarik & lepas gambar asli ke sini
                </p>
                <p className="text-[11px] text-zinc-500">
                  atau klik untuk menelusuri dari folder lokal
                </p>
              </div>
              <div className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-850/60 px-3 py-1.5 rounded-lg max-w-sm leading-relaxed">
                Rekomendasi format <strong className="text-zinc-300">PNG lossless</strong>. Format JPEG tetap didukung namun dapat merusak data akibat kompresi otomatis.
              </div>
            </div>
          ) : (
            /* Image Preview and Analysis area */
            <div className="space-y-4">
              <div className="relative border border-zinc-805 rounded-2xl overflow-hidden bg-zinc-950 flex justify-center items-center min-h-[220px] max-h-[340px]">
                <img
                  src={imagePreview}
                  alt="Source preview"
                  referrerPolicy="no-referrer"
                  className="max-h-[340px] max-w-full object-contain"
                />
              </div>

              {/* Information Row */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl space-y-0.5">
                  <span className="text-zinc-500 block text-[10px]">TIPE FILE:</span>
                  <span className="text-zinc-300 font-semibold uppercase">{imageFile?.type.split("/")[1]}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl space-y-0.5">
                  <span className="text-zinc-500 block text-[10px]">UKURAN DIMENSI:</span>
                  <span className="text-zinc-300 font-semibold">
                    {imageDimensions ? `${imageDimensions.width} × ${imageDimensions.height} px` : "Sedang menghitung..."}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Processed Stego Output View */}
        {success && stegoImageURL && (
          <div className="bg-zinc-900 border border-blue-500/20 rounded-2xl p-6 shadow-blue-500/5 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Sukses! Pesan Tersemat Sempurna</h4>
                <p className="text-[10px] text-zinc-400">Piksel LSB ter-update tanpa mengubah visualisasi gambar</p>
              </div>
            </div>

            <div className="relative border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 flex justify-center items-center min-h-[180px] max-h-[260px]">
              <img
                src={stegoImageURL}
                alt="Concealed output"
                referrerPolicy="no-referrer"
                className="max-h-[260px] max-w-full object-contain"
              />
            </div>

            <div className="flex gap-2">
              <a
                href={stegoImageURL}
                download={`[steganografi]_${imageFile ? imageFile.name.replace(/\.[^/.]+$/, "") : "stego"}.png`}
                className="w-full py-3 px-4 rounded-xl text-xs font-extrabold tracking-wide bg-blue-600 hover:bg-blue-500 text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
              >
                <Download className="w-4 h-4" />
                Unduh Gambar Stego (PNG)
              </a>
            </div>
            <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
              Catatan: Pastikan untuk menyimpan sebagai berkas asli (format .png) agar integritas biner LSB tetap terjaga. Don&apos;t compress!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
