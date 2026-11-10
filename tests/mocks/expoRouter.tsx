/* Minimal expo-router for component tests: navigation calls are recorded, params are settable. */
import React, { useEffect } from 'react'
import { Text } from 'react-native'

export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
}

let params: Record<string, string | undefined> = {}

/** Sets the route parameters returned by useLocalSearchParams in the next renders. */
export function setParams(next: Record<string, string | undefined>): void {
  params = next
}

export const useLocalSearchParams = () => params

export const useFocusEffect = (effect: () => void) => useEffect(effect, [effect])

export const Link = ({ href, children }: { href: unknown; children: React.ReactNode }) => (
  <Text accessibilityRole="link" onPress={() => router.push(href)}>
    {children}
  </Text>
)

export const Redirect = ({ href }: { href: string }) => <Text>{`redirect:${href}`}</Text>

const Screen = () => null
const Protected = ({ children }: { children: React.ReactNode }) => <>{children}</>
const Navigator = Object.assign(({ children }: { children?: React.ReactNode }) => <>{children}</>, {
  Screen,
  Protected,
})
export const Stack = Navigator
export const Tabs = Navigator
