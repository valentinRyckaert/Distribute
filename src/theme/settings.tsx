import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { colors, highContrastColors, TEXT_SCALES, type ColorToken, type TextScale } from './tokens'

/** The reading comfort settings chosen by the user. */
export interface Settings {
  textScale: TextScale
  readAloud: boolean
  highContrast: boolean
  reduceMotion: boolean
  /** True once the welcome screen has been seen. */
  onboarded: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  textScale: 'normal',
  readAloud: true,
  highContrast: false,
  reduceMotion: false,
  onboarded: false,
}

const STORAGE_KEY = 'distribute-settings'

interface SettingsContextValue {
  settings: Settings
  /** Changes some settings and saves them on the device. */
  updateSettings: (changes: Partial<Settings>) => void
  /** False until the saved settings have been read. */
  loaded: boolean
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  loaded: true,
})

/** Loads the settings saved on the device and shares them with the whole app. */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => saved && setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) }))
      .catch(() => {}) // unreadable settings: keep the defaults
      .finally(() => setLoaded(true))
  }, [])

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      loaded,
      updateSettings: (changes) =>
        setSettings((previous) => {
          const next = { ...previous, ...changes }
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {})
          return next
        }),
    }),
    [settings, loaded],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

/** Returns the reading settings and the function to change them. */
export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext)
}

/** Returns the colors and text scale to use, according to the reading settings. */
export function useTheme(): { colors: Record<ColorToken, string>; scale: number } {
  const { settings } = useSettings()
  return useMemo(
    () => ({
      colors: settings.highContrast ? { ...colors, ...highContrastColors } : colors,
      scale: TEXT_SCALES[settings.textScale],
    }),
    [settings.highContrast, settings.textScale],
  )
}
