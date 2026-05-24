/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import CryptoJS from 'crypto-js';

// Magic identifier to confirm steganographic presence
const MAGIC_HEADER = "STEG"; // 4 bytes: [83, 84, 69, 71]

/**
 * Converts a string to a Uint8Array of UTF-8 bytes.
 */
export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Converts a Uint8Array of UTF-8 bytes to a string.
 */
export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Encrypts a message using AES.
 * @param message The raw text message to encrypt
 * @param secretKey The password/key for encryption
 * @returns The encrypted ciphertext as a string
 */
export function encryptMessage(message: string, secretKey: string): string {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
}

/**
 * Decrypts an AES-encrypted message.
 * @param ciphertext The encrypted ciphertext string
 * @param secretKey The password/key for decryption
 * @returns The decrypted raw text message
 */
export function decryptMessage(ciphertext: string, secretKey: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  if (!decrypted) {
    throw new Error("Password salah atau data pesan terkorupsi.");
  }
  return decrypted;
}

/**
 * Computes the maximum text capacity (in characters/bytes) of an image with given width and height.
 */
export function getMessageCapacity(width: number, height: number): number {
  const totalPixels = width * height;
  const totalColorChannels = totalPixels * 3; // R, G, B channels
  const totalBytes = Math.floor(totalColorChannels / 8);
  
  // Subtract magic header (4 bytes) and payload length integer (4 bytes)
  const availableBytes = totalBytes - 8;
  return Math.max(0, availableBytes);
}

/**
 * Embeds a payload into the pixel array of an ImageData object using LSB.
 * @param imageData The canvas ImageData object containing original pixels
 * @param payload The binary data (Uint8Array) to conceal
 * @returns A new ImageData object with the secret concealed
 */
export function embedPayload(imageData: ImageData, payload: Uint8Array): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const pixelData = new Uint8ClampedArray(imageData.data); // Copy to avoid mutating in-place abruptly

  const magicBytes = stringToBytes(MAGIC_HEADER);
  const lengthBytes = new Uint8Array(4);
  const payloadLength = payload.length;

  // Set length bytes as 32-bit Big-Endian representation
  lengthBytes[0] = (payloadLength >> 24) & 0xFF;
  lengthBytes[1] = (payloadLength >> 16) & 0xFF;
  lengthBytes[2] = (payloadLength >> 8) & 0xFF;
  lengthBytes[3] = payloadLength & 0xFF;

  // Combine magic, length, and payload into a single packed Uint8Array
  const totalBuffer = new Uint8Array(magicBytes.length + lengthBytes.length + payload.length);
  totalBuffer.set(magicBytes, 0);
  totalBuffer.set(lengthBytes, magicBytes.length);
  totalBuffer.set(payload, magicBytes.length + lengthBytes.length);

  const neededBits = totalBuffer.length * 8;
  const maxCapacityBits = width * height * 3;

  if (neededBits > maxCapacityBits) {
    throw new Error(`Ukuran pesan terlalu besar untuk gambar ini. Dibutuhkan setidaknya ${neededBits} bit, kapasitas gambar hanya ${maxCapacityBits} bit.`);
  }

  let channelIdx = 0;

  function writeBit(bit: number) {
    // Skip the alpha channel (index 3, 7, 11, etc. which has index % 4 === 3)
    while (channelIdx % 4 === 3) {
      channelIdx++;
    }
    if (channelIdx >= pixelData.length) {
      throw new Error("Melebihi kapasitas piksel gambar saat menyisipkan bit.");
    }
    // Set LSB to our bit
    pixelData[channelIdx] = (pixelData[channelIdx] & 0xFE) | bit;
    channelIdx++;
  }

  // Write all bytes to LSBs
  for (let i = 0; i < totalBuffer.length; i++) {
    const byteVal = totalBuffer[i];
    for (let j = 7; j >= 0; j--) {
      const bit = (byteVal >> j) & 1;
      writeBit(bit);
    }
  }

  return new ImageData(pixelData, width, height);
}

/**
 * Extracts a concealed payload from the pixel array of an ImageData object.
 * @param imageData The canvas ImageData object containing stego pixels
 * @returns The extracted Uint8Array binary data
 */
export function extractPayload(imageData: ImageData): Uint8Array {
  const pixelData = imageData.data;
  let channelIdx = 0;

  function readBit(): number {
    while (channelIdx % 4 === 3) {
      channelIdx++;
    }
    if (channelIdx >= pixelData.length) {
      throw new Error("Sinyal piksel habis sebelum enkapsulasi pesan selesai dibaca.");
    }
    const bit = pixelData[channelIdx] & 1;
    channelIdx++;
    return bit;
  }

  function readByte(): number {
    let val = 0;
    for (let j = 7; j >= 0; j--) {
      const bit = readBit();
      val |= (bit << j);
    }
    return val;
  }

  // 1. Read first 4 bytes for Magic Header
  const magicBytes = new Uint8Array(4);
  for (let i = 0; i < 4; i++) {
    magicBytes[i] = readByte();
  }
  const extractedMagic = bytesToString(magicBytes);

  if (extractedMagic !== MAGIC_HEADER) {
    throw new Error("Format gambar tidak valid atau tidak mengandung pesan rahasia yang disisipkan oleh aplikasi ini.");
  }

  // 2. Read next 4 bytes for Payload Length
  const lengthBytes = new Uint8Array(4);
  for (let i = 0; i < 4; i++) {
    lengthBytes[i] = readByte();
  }
  const payloadLength = 
    (lengthBytes[0] << 24) | 
    (lengthBytes[1] << 16) | 
    (lengthBytes[2] << 8) | 
    lengthBytes[3];

  // Safeguard: make sure the payload length computed is reasonable based on image pixel constraints
  const maxPossibleBytes = Math.floor((pixelData.length * 3 / 4) / 8);
  if (payloadLength < 0 || payloadLength > maxPossibleBytes) {
    throw new Error("Panjang pesan terdeteksi tidak valid atau file gambar rusak.");
  }

  // 3. Read actual Payload Bytes
  const payload = new Uint8Array(payloadLength);
  for (let i = 0; i < payloadLength; i++) {
    payload[i] = readByte();
  }

  return payload;
}
