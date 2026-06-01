/**
 * PII (Personally Identifiable Information) Masking Utilities
 * Masks sensitive data before sending responses
 */

/**
 * Mask email address - show first 2 chars and domain
 * Example: john.doe@example.com -> jo***@example.com
 */
export const maskEmail = (email: string): string => {
  if (!email) return '';
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  const visibleChars = Math.min(2, localPart.length);
  const maskedLocal = localPart.slice(0, visibleChars) + '*'.repeat(Math.max(3, localPart.length - visibleChars));
  return `${maskedLocal}@${domain}`;
};

/**
 * Mask phone number - show last 4 digits
 * Example: +8801712345678 -> +8801******78
 */
export const maskPhone = (phone: string): string => {
  if (!phone) return '';
  const phoneStr = phone.toString();
  if (phoneStr.length < 4) return phoneStr;
  
  const visibleStart = Math.max(4, phoneStr.length - 4);
  const masked = phoneStr.slice(0, visibleStart) + '*'.repeat(phoneStr.length - visibleStart);
  return masked;
};

/**
 * Mask NID (National ID) - show last 4 digits
 * Example: 1234567890123 -> *********0123
 */
export const maskNID = (nid: string): string => {
  if (!nid) return '';
  const nidStr = nid.toString();
  if (nidStr.length < 4) return nidStr;
  
  const visibleChars = 4;
  const masked = '*'.repeat(nidStr.length - visibleChars) + nidStr.slice(-visibleChars);
  return masked;
};

/**
 * Mask full name - show first name initial and last name
 * Example: John Doe -> J. Doe
 */
export const maskName = (name: string): string => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 0) return name;
  
  if (parts.length === 1) {
    return parts[0][0] + '*'.repeat(parts[0].length - 1);
  }
  
  const firstNameInitial = parts[0][0];
  const lastName = parts[parts.length - 1];
  return `${firstNameInitial}. ${lastName}`;
};

/**
 * Mask address - show city and country only
 */
export const maskAddress = (address: string): string => {
  if (!address) return '';
  // Simple heuristic: take last 2-3 words as city/country
  const parts = address.trim().split(',').map(p => p.trim());
  if (parts.length <= 2) return address;
  
  return parts.slice(-2).join(', ');
};

/**
 * Mask all PII fields in a user object
 */
export const maskUserPII = (
  user: Record<string, unknown>,
  fieldsToMask: string[] = ['email', 'phone', 'nid', 'name', 'address']
): Record<string, unknown> => {
  const masked = { ...user };
  
  if (fieldsToMask.includes('email') && masked.email) {
    masked.email = maskEmail(masked.email as string);
  }
  
  if (fieldsToMask.includes('phone') && masked.phone) {
    masked.phone = maskPhone(masked.phone as string);
  }
  
  if (fieldsToMask.includes('nid') && masked.nid) {
    masked.nid = maskNID(masked.nid as string);
  }
  
  if (fieldsToMask.includes('name') && masked.name) {
    masked.name = maskName(masked.name as string);
  }
  
  if (fieldsToMask.includes('address') && masked.address) {
    masked.address = maskAddress(masked.address as string);
  }
  
  return masked;
};

/**
 * Mask PII in an array of user objects
 */
export const maskUsersPII = (
  users: Record<string, unknown>[],
  fieldsToMask?: string[]
): Record<string, unknown>[] => {
  return users.map(user => maskUserPII(user, fieldsToMask));
};
