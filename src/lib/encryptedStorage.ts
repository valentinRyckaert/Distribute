import AsyncStorage from '@react-native-async-storage/async-storage'
import { AESEncryptionKey, AESSealedData, aesDecryptAsync, aesEncryptAsync } from 'expo-crypto'
import * as SecureStore from 'expo-secure-store'

const KEY_NAME = 'distribute-session-key'

/** Returns the AES key kept in the OS keychain, creating it on first use. */
async function getKey(): Promise<AESEncryptionKey> {
  const stored = await SecureStore.getItemAsync(KEY_NAME)
  if (stored) return AESEncryptionKey.import(stored, 'base64')
  const key = await AESEncryptionKey.generate()
  await SecureStore.setItemAsync(KEY_NAME, await key.encoded('base64'))
  return key
}

/**
 * Storage for the Supabase session: values are encrypted with AES-256-GCM and stored in
 * AsyncStorage, the key lives in the keychain (SecureStore alone is limited to 2 KB per value).
 * shortcut: native only (SecureStore has no web implementation), add a web storage if the web build ships.
 */
export const encryptedStorage = {
  /** Reads and decrypts a value; returns null when it is missing or cannot be decrypted. */
  async getItem(name: string): Promise<string | null> {
    const sealed = await AsyncStorage.getItem(name)
    if (!sealed) return null
    try {
      const bytes = await aesDecryptAsync(AESSealedData.fromCombined(sealed), await getKey())
      return new TextDecoder().decode(bytes)
    } catch {
      return null
    }
  },

  /** Encrypts and stores a value. */
  async setItem(name: string, value: string): Promise<void> {
    const sealed = await aesEncryptAsync(new TextEncoder().encode(value), await getKey())
    await AsyncStorage.setItem(name, await sealed.combined('base64'))
  },

  /** Removes a value. */
  async removeItem(name: string): Promise<void> {
    await AsyncStorage.removeItem(name)
  },
}
