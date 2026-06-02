/**
 * AES-256-GCM Encryption for Patient Data
 * Encrypts sensitive PII before storing in database
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Get encryption key from environment variable
 */
const getEncryptionKey = (): Buffer => {
  const key = process.env.PATIENT_DATA_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('PATIENT_DATA_ENCRYPTION_KEY environment variable is not set');
  }
  return Buffer.from(key, 'hex');
};

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export const encryptPatientData = (plaintext: string): string => {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine salt + iv + tag + encrypted
    const combined = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex'),
    ]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt patient data');
  }
};

/**
 * Decrypt sensitive data using AES-256-GCM
 */
export const decryptPatientData = (ciphertext: string): string => {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(ciphertext, 'base64');

    const iv = combined.slice(SALT_LENGTH, TAG_POSITION);
    const tag = combined.slice(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = combined.slice(ENCRYPTED_POSITION);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt patient data');
  }
};

/**
 * Encrypt phone number
 */
export const encryptPhone = (phone: string): string => {
  return encryptPatientData(phone);
};

/**
 * Decrypt phone number
 */
export const decryptPhone = (encryptedPhone: string): string => {
  return decryptPatientData(encryptedPhone);
};

/**
 * Encrypt address
 */
export const encryptAddress = (address: string): string => {
  return encryptPatientData(address);
};

/**
 * Decrypt address
 */
export const decryptAddress = (encryptedAddress: string): string => {
  return decryptPatientData(encryptedAddress);
};

/**
 * Check if a string is encrypted (base64 format check)
 */
export const isEncrypted = (data: string): boolean => {
  try {
    const combined = Buffer.from(data, 'base64');
    return combined.length >= SALT_LENGTH + IV_LENGTH + TAG_LENGTH;
  } catch {
    return false;
  }
};
