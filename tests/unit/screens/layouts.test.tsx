import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import TabLayout from '@/app/(tabs)/_layout'
import NotFoundScreen from '@/app/+not-found'
import RootLayout from '@/app/_layout'
import { supabase } from '@/src/lib/supabase'
import { router } from '../../mocks/expoRouter'

jest.mock('@expo-google-fonts/atkinson-hyperlegible-next', () => ({ useFonts: () => [true] }))

const auth = supabase.auth as unknown as Record<string, jest.Mock>

describe('RootLayout', () => {
  it('waits for the session, follows its changes and unsubscribes', async () => {
    const unsubscribe = jest.fn()
    let onChange: (event: string, session: unknown) => void = () => {}
    auth.onAuthStateChange.mockImplementation((callback) => {
      onChange = callback
      return { data: { subscription: { unsubscribe } } }
    })
    auth.getSession.mockResolvedValue({
      data: { session: { user: { app_metadata: { role: 'admin' } } } },
    })
    const { unmount } = await render(<RootLayout />)
    await waitFor(() => expect(auth.getSession).toHaveBeenCalled())
    onChange('SIGNED_OUT', null)
    await unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})

describe('TabLayout', () => {
  it('renders the tab navigator', async () => {
    await render(<TabLayout />)
    expect(screen.toJSON()).toBeNull()
  })
})

describe('NotFoundScreen', () => {
  it('leads back home', async () => {
    await render(<NotFoundScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Retour à l’accueil' }))
    expect(router.replace).toHaveBeenCalledWith('/')
  })
})
