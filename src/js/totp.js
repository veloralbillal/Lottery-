// ============================================================================
// REAL GOOGLE AUTHENTICATOR (TOTP RFC 6238) HELPER MODULE
// ============================================================================

export const TOTP = {
  // Base32 alphabet for Google Authenticator secret keys
  BASE32_CHARS: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",

  /**
   * Generates a random 16-character Base32 secret key
   */
  generateSecret(length = 16) {
    let secret = "";
    const chars = this.BASE32_CHARS;
    for (let i = 0; i < length; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  },

  /**
   * Decodes a Base32 string into a Uint8Array
   */
  base32ToBytes(base32) {
    const cleanBase32 = (base32 || "").toUpperCase().replace(/[^A-Z2-7]/g, "");
    let bits = "";
    for (let i = 0; i < cleanBase32.length; i++) {
      const val = this.BASE32_CHARS.indexOf(cleanBase32.charAt(i));
      if (val !== -1) {
        bits += val.toString(2).padStart(5, "0");
      }
    }
    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
    }
    return bytes;
  },

  /**
   * Calculates a 6-digit TOTP token for a given Base32 secret at time offset (in 30s steps)
   */
  async generateToken(secret, timeStepOffset = 0) {
    try {
      const keyBytes = this.base32ToBytes(secret);
      if (keyBytes.length === 0) return null;

      const epoch = Math.floor(Date.now() / 1000);
      const timeStep = Math.floor(epoch / 30) + timeStepOffset;

      // Convert timeStep to 8-byte big-endian ArrayBuffer
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setUint32(0, 0, false); // High 32 bits
      view.setUint32(4, timeStep, false); // Low 32 bits

      // Import HMAC key via Web Crypto API
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "HMAC", hash: { name: "SHA-1" } },
        false,
        ["sign"]
      );

      // Sign the time counter buffer
      const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, buffer);
      const sigBytes = new Uint8Array(signature);

      // Dynamic Truncation
      const offset = sigBytes[sigBytes.length - 1] & 0x0f;
      const binary =
        ((sigBytes[offset] & 0x7f) << 24) |
        ((sigBytes[offset + 1] & 0xff) << 16) |
        ((sigBytes[offset + 2] & 0xff) << 8) |
        (sigBytes[offset + 3] & 0xff);

      const otp = binary % 1000000;
      return String(otp).padStart(6, "0");
    } catch (err) {
      console.error("TOTP Generation Error:", err);
      return null;
    }
  },

  /**
   * Verifies a user-entered 6-digit code against a secret key, checking current and adjacent time windows
   */
  async verifyCode(secret, userInputCode) {
    if (!secret || !userInputCode) return false;
    const cleanCode = String(userInputCode).trim();
    if (cleanCode.length !== 6 || isNaN(cleanCode)) return false;

    // Check time windows: current step (0), previous step (-1), next step (+1) for clock drift tolerance
    const offsets = [0, -1, 1];
    for (const offset of offsets) {
      const validToken = await this.generateToken(secret, offset);
      if (validToken && validToken === cleanCode) {
        return true;
      }
    }
    return false;
  },

  /**
   * Returns otpauth URI for QR code generation
   */
  getOtpAuthURI(username, secret, issuer = "Lottery Winner") {
    const cleanUser = encodeURIComponent(username || "User");
    const cleanIssuer = encodeURIComponent(issuer);
    return `otpauth://totp/${cleanIssuer}:${cleanUser}?secret=${secret}&issuer=${cleanIssuer}&algorithm=SHA1&digits=6&period=30`;
  },

  /**
   * Generates a QR code image URL for Google Authenticator
   */
  getQRCodeURL(username, secret) {
    const uri = this.getOtpAuthURI(username, secret);
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(uri)}`;
  }
};
