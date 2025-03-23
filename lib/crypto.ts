import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

// Promisify scrypt
const scryptAsync = promisify(scrypt);

// Function to hash a password
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = randomBytes(16).toString('hex');

  // Hash the password
  const buf = await scryptAsync(password, salt, 64) as Buffer;

  // Return the salt and the hashed password
  return `${salt}:${buf.toString('hex')}`;
}

// Function to verify a password against a hash
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Split the hash into salt and hash components
  const [salt, hash] = storedHash.split(':');

  // If the hash is not in the expected format, return false
  if (!salt || !hash) return false;

  // Hash the input password with the same salt
  const buf = await scryptAsync(password, salt, 64) as Buffer;

  // Convert the stored hash to a buffer
  const storedHashBuf = Buffer.from(hash, 'hex');

  // Compare the hashed input password with the stored hash
  // Using timingSafeEqual to prevent timing attacks
  try {
    return timingSafeEqual(buf, storedHashBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}
