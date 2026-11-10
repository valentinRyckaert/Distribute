/* Global mocks for native modules that do not exist under Jest. */
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>()
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => void store.set(key, value)),
    deleteItemAsync: jest.fn(async (key: string) => void store.delete(key)),
  }
})

jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn() }))

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }))

jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = jest.requireActual('react-native')
  const Icon = ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text>
  Icon.glyphMap = {}
  return Icon
})

jest.mock('expo-router', () => require('./mocks/expoRouter'))

jest.mock('@/src/lib/supabase', () => require('./mocks/supabase'))

jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
)
