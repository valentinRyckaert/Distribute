import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { encryptedStorage } from '@/src/lib/encryptedStorage'

// Reversible fake cipher: enough to check that what is stored is not the plain value.
jest.mock('expo-crypto', () => {
  const sealed = (bytes: Uint8Array) => ({
    combined: async () => Buffer.from(bytes.map((b) => b ^ 42)).toString('base64'),
  })
  return {
    AESEncryptionKey: {
      generate: jest.fn(async () => ({ encoded: async () => 'a2V5' })),
      import: jest.fn(async () => ({})),
    },
    AESSealedData: {
      fromCombined: (value: string) => Uint8Array.from(Buffer.from(value, 'base64')),
    },
    aesEncryptAsync: jest.fn(async (bytes: Uint8Array) => sealed(bytes)),
    aesDecryptAsync: jest.fn(async (data: Uint8Array) => {
      if (data.length === 0) throw new Error('bad tag')
      return data.map((b) => b ^ 42)
    }),
  }
})

describe('encryptedStorage', () => {
  beforeEach(() => AsyncStorage.clear())

  it('stores an encrypted value and reads it back', async () => {
    await encryptedStorage.setItem('session', '{"token":"secret"}')
    const raw = await AsyncStorage.getItem('session')
    expect(raw).not.toContain('secret')
    expect(await encryptedStorage.getItem('session')).toBe('{"token":"secret"}')
  })

  it('creates the key once and keeps it in the keychain', async () => {
    await encryptedStorage.setItem('a', '1')
    await encryptedStorage.setItem('b', '2')
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1)
  })

  it('returns null for a missing or undecryptable value', async () => {
    expect(await encryptedStorage.getItem('missing')).toBeNull()
    await AsyncStorage.setItem('broken', '')
    await AsyncStorage.setItem('broken', ' ')
    expect(await encryptedStorage.getItem('broken')).toBeNull()
  })

  it('removes a value', async () => {
    await encryptedStorage.setItem('session', 'x')
    await encryptedStorage.removeItem('session')
    expect(await AsyncStorage.getItem('session')).toBeNull()
  })
})
