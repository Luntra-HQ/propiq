/**
 * Authentication Utility Functions
 * Shared password hashing and verification functions used across auth modules
 */

// ============================================
// SECURE PASSWORD HASHING (PBKDF2-SHA256)
// ============================================

const PBKDF2_ITERATIONS = 600000; // ~100ms on server, OWASP recommended
const PBKDF2_SALT_LENGTH = 16; // 128 bits
const PBKDF2_KEY_LENGTH = 32; // 256 bits
const HASH_VERSION = "v1";

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate cryptographically secure random salt
 */
function generateSalt(): Uint8Array {
  const salt = new Uint8Array(PBKDF2_SALT_LENGTH);
  crypto.getRandomValues(salt);
  return salt;
}

/**
 * Hash password using PBKDF2-SHA256
 * Returns formatted string: $pbkdf2-sha256$v1$iterations$salt$hash
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = generateSalt();

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    PBKDF2_KEY_LENGTH * 8 // bits
  );

  // Format: $pbkdf2-sha256$v1$iterations$salt$hash
  const saltB64 = arrayBufferToBase64(salt.buffer);
  const hashB64 = arrayBufferToBase64(derivedBits);

  return `$pbkdf2-sha256$${HASH_VERSION}$${PBKDF2_ITERATIONS}$${saltB64}$${hashB64}`;
}

/**
 * Verify password against PBKDF2 hash
 */
async function verifyPbkdf2Password(password: string, storedHash: string): Promise<boolean> {
  try {
    // Parse stored hash: $pbkdf2-sha256$v1$iterations$salt$hash
    const parts = storedHash.split("$");
    if (parts.length !== 6) {
      console.error("[AUTH] Invalid PBKDF2 hash format");
      return false;
    }

    const [, algo, version, iterationsStr, saltB64, hashB64] = parts;

    if (algo !== "pbkdf2-sha256") {
      console.error("[AUTH] Unknown algorithm:", algo);
      return false;
    }

    const iterations = parseInt(iterationsStr, 10);
    const salt = new Uint8Array(base64ToArrayBuffer(saltB64));
    const storedHashBytes = new Uint8Array(base64ToArrayBuffer(hashB64));

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      PBKDF2_KEY_LENGTH * 8
    );

    const derivedBytes = new Uint8Array(derivedBits);

    // Constant-time comparison to prevent timing attacks
    let result = 0;
    for (let i = 0; i < storedHashBytes.length; i++) {
      result |= storedHashBytes[i] ^ derivedBytes[i];
    }

    return result === 0;
  } catch (e) {
    console.error("[AUTH] Error verifying PBKDF2 password:", e);
    return false;
  }
}

/**
 * Check if hash is legacy SHA-256 format (64 hex characters)
 */
function isLegacyHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}

/**
 * Verify password against legacy SHA-256 hash
 * This is for backward compatibility with old user accounts
 */
async function verifyLegacySha256Password(password: string, storedHash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const salt = "propiq_salt_2025"; // Legacy salt
    const data = encoder.encode(password + salt);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return hashHex === storedHash.toLowerCase();
  } catch (e) {
    console.error("[AUTH] Error verifying legacy password:", e);
    return false;
  }
}

/**
 * Verify password against stored hash
 * Supports both new PBKDF2 format and legacy SHA-256 (for migration)
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Check if it's a new PBKDF2 hash
  if (storedHash.startsWith("$pbkdf2-sha256$")) {
    return verifyPbkdf2Password(password, storedHash);
  }

  // Check if it's a legacy SHA-256 hash
  if (isLegacyHash(storedHash)) {
    return verifyLegacySha256Password(password, storedHash);
  }

  console.error("[AUTH] Unknown hash format");
  return false;
}
