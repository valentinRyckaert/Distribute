import AsyncStorage from '@react-native-async-storage/async-storage'
import { act, render, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import { Text } from 'react-native'
import { SettingsProvider, useSettings, useTheme } from '@/src/theme/settings'
import { colors } from '@/src/theme/tokens'

let api: ReturnType<typeof useSettings>
let theme: ReturnType<typeof useTheme>

function Probe() {
  api = useSettings()
  theme = useTheme()
  return <Text>{api.loaded ? 'loaded' : 'loading'}</Text>
}

describe('SettingsProvider', () => {
  beforeEach(() => AsyncStorage.clear())

  it('loads saved settings over the defaults', async () => {
    await AsyncStorage.setItem('distribute-settings', JSON.stringify({ textScale: 'xlarge' }))
    await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    )
    await screen.findByText('loaded')
    expect(api.settings.textScale).toBe('xlarge')
    expect(api.settings.readAloud).toBe(true)
    expect(theme.scale).toBe(1.3)
  })

  it('saves changes and applies high contrast colors', async () => {
    await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    )
    await screen.findByText('loaded')
    await act(async () => api.updateSettings({ highContrast: true }))
    expect(theme.colors.textSecondary).toBe(colors.textPrimary)
    await waitFor(async () =>
      expect(JSON.parse((await AsyncStorage.getItem('distribute-settings')) ?? '{}')).toMatchObject(
        {
          highContrast: true,
        },
      ),
    )
  })

  it('keeps the defaults when the saved settings are unreadable', async () => {
    await AsyncStorage.setItem('distribute-settings', '{not json')
    await render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    )
    await screen.findByText('loaded')
    expect(api.settings.textScale).toBe('normal')
  })
})
