import AsyncStorage from '@react-native-async-storage/async-storage'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import { Alert, type AlertButton } from 'react-native'
import AccountScreen from '@/app/(tabs)/account'
import CallbackScreen from '@/app/callback'
import MyReportsScreen from '@/app/my-reports'
import NotificationsScreen from '@/app/notifications'
import ComfortScreen from '@/app/settings/comfort'
import PasswordScreen from '@/app/settings/password'
import * as api from '@/src/lib/api'
import { SettingsProvider } from '@/src/theme/settings'
import { admin, card, marie } from '../../fixtures'
import { router, setParams } from '../../mocks/expoRouter'

jest.mock('@/src/lib/api')
const mocked = jest.mocked(api)
const alert = jest.spyOn(Alert, 'alert')

beforeEach(async () => {
  jest.clearAllMocks()
  setParams({})
  await AsyncStorage.clear()
  mocked.getCurrentUser.mockResolvedValue(marie)
  mocked.fetchMyReports.mockResolvedValue([
    card(),
    card({ REP_id: 2, REP_solution: null, REP_libelle: 'Imprimante' }),
  ])
  mocked.fetchFavorites.mockResolvedValue([card({ REP_id: 3, REP_libelle: 'Gardée' })])
  mocked.countUnreadNotifications.mockResolvedValue(1)
  mocked.markNotificationsRead.mockResolvedValue()
  mocked.signOut.mockResolvedValue()
})

describe('AccountScreen', () => {
  it('shows the profile, counters, my reports and kept reports', async () => {
    await render(<AccountScreen />)
    expect(await screen.findByText('Marie Durand')).toBeOnTheScreen()
    expect(screen.getByText('MD')).toBeOnTheScreen()
    expect(screen.getByText('signalements en attente')).toBeOnTheScreen()
    expect(screen.getByText('Gardée')).toBeOnTheScreen()
    expect(screen.queryByText('Espace support (admin)')).toBeNull()
  })

  it('opens the settings screens', async () => {
    await render(<AccountScreen />)
    await fireEvent.press(await screen.findByRole('button', { name: 'Confort de lecture' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Notifications, 1 nouveau' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Changer mon mot de passe' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Aide et contact' }))
    expect(router.push.mock.calls.map((call) => call[0])).toEqual([
      '/settings/comfort',
      '/notifications',
      '/settings/password',
      '/callback',
    ])
  })

  it('shows the support space to admins and signs out after confirmation', async () => {
    mocked.getCurrentUser.mockResolvedValue(admin)
    mocked.fetchMyReports.mockResolvedValue([])
    await render(<AccountScreen />)
    expect(await screen.findByText('Vous n’avez encore rien signalé.')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Espace support (admin)' }))
    expect(router.push).toHaveBeenCalledWith('/support')
    await fireEvent.press(screen.getByRole('button', { name: 'Se déconnecter' }))
    const buttons = alert.mock.calls.at(-1)?.[2] as AlertButton[]
    buttons.find((button) => button.text === 'Se déconnecter')?.onPress?.()
    expect(mocked.signOut).toHaveBeenCalled()
  })
})

describe('MyReportsScreen', () => {
  it('lists all my reports', async () => {
    await render(<MyReportsScreen />)
    expect(await screen.findByText('Imprimante')).toBeOnTheScreen()
  })
})

describe('NotificationsScreen', () => {
  it('lists notifications, marks them read and opens the report', async () => {
    mocked.fetchNotifications.mockResolvedValue([
      {
        NOT_id: 1,
        user_id: 'u1',
        REP_id: 4,
        NOT_message: 'Une solution a été proposée',
        NOT_read: false,
        NOT_created_at: new Date().toISOString(),
      },
    ])
    await render(<NotificationsScreen />)
    expect(await screen.findByText('Une solution a été proposée')).toBeOnTheScreen()
    expect(mocked.markNotificationsRead).toHaveBeenCalled()
    await fireEvent.press(screen.getByText('Une solution a été proposée'))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/reports/[id]', params: { id: '4' } })
  })

  it('says when there is nothing new', async () => {
    mocked.fetchNotifications.mockResolvedValue([])
    await render(<NotificationsScreen />)
    expect(await screen.findByText('Rien de nouveau pour le moment.')).toBeOnTheScreen()
  })
})

describe('CallbackScreen', () => {
  it('validates the phone number, then confirms the request', async () => {
    setParams({ reportId: '4' })
    mocked.requestCallback.mockResolvedValue()
    await render(<CallbackScreen />)
    expect(
      screen.getByText('Le support verra la fiche sur laquelle vous êtes bloqué.'),
    ).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Être rappelé' }))
    expect(screen.getByText('Numéro de téléphone non valide.')).toBeOnTheScreen()
    await fireEvent.changeText(screen.getByLabelText('Votre numéro de téléphone'), '06 12 34 56 78')
    await fireEvent.press(screen.getByRole('button', { name: 'Être rappelé' }))
    expect(mocked.requestCallback).toHaveBeenCalledWith('06 12 34 56 78', '', 4)
    expect(await screen.findByText('Demande envoyée')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Retour à l’accueil' }))
    expect(router.replace).toHaveBeenCalledWith('/')
  })

  it('shows sending errors', async () => {
    mocked.requestCallback.mockRejectedValue(new Error('Network request failed'))
    await render(<CallbackScreen />)
    await fireEvent.changeText(screen.getByLabelText('Votre numéro de téléphone'), '0612345678')
    await fireEvent.press(screen.getByRole('button', { name: 'Être rappelé' }))
    expect(await screen.findByText(/Vérifiez votre connexion/)).toBeOnTheScreen()
    expect(mocked.requestCallback).toHaveBeenCalledWith('0612345678', '', null)
  })
})

describe('ComfortScreen', () => {
  it('changes and saves the reading settings', async () => {
    await render(
      <SettingsProvider>
        <ComfortScreen />
      </SettingsProvider>,
    )
    await fireEvent.press(await screen.findByRole('radio', { name: 'Texte Très grand' }))
    expect(screen.getByRole('radio', { name: 'Texte Très grand' })).toBeSelected()
    await fireEvent(screen.getByLabelText('Contraste renforcé'), 'valueChange', true)
    await fireEvent(screen.getByLabelText('Réduire les animations'), 'valueChange', true)
    await fireEvent(screen.getByLabelText('Lire les fiches à voix haute'), 'valueChange', false)
    await waitFor(async () =>
      expect(JSON.parse((await AsyncStorage.getItem('distribute-settings')) ?? '{}')).toMatchObject(
        {
          textScale: 'xlarge',
          highContrast: true,
          reduceMotion: true,
          readAloud: false,
        },
      ),
    )
    expect(screen.queryByText('Écouter')).toBeNull()
  })
})

describe('PasswordScreen', () => {
  it('requires the current password and a strong new one', async () => {
    await render(<PasswordScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Changer mon mot de passe' }))
    expect(screen.getByText('Saisissez votre mot de passe actuel.')).toBeOnTheScreen()
    await fireEvent.changeText(screen.getByLabelText('Mot de passe actuel'), 'old')
    await fireEvent.changeText(screen.getByLabelText('Nouveau mot de passe'), 'password123')
    await fireEvent.changeText(
      screen.getByLabelText('Retapez le nouveau mot de passe'),
      'password123',
    )
    mocked.changePassword.mockRejectedValueOnce(new Error('Invalid login credentials'))
    await fireEvent.press(screen.getByRole('button', { name: 'Changer mon mot de passe' }))
    expect(await screen.findByText('Le mot de passe actuel est incorrect.')).toBeOnTheScreen()
    mocked.changePassword.mockResolvedValueOnce()
    await fireEvent.press(screen.getByRole('button', { name: 'Changer mon mot de passe' }))
    await waitFor(() => expect(router.back).toHaveBeenCalled())
    expect(mocked.changePassword).toHaveBeenLastCalledWith('old', 'password123')
  })

  it('translates other errors', async () => {
    mocked.changePassword.mockRejectedValueOnce(new Error('email rate limit exceeded'))
    await render(<PasswordScreen />)
    await fireEvent.changeText(screen.getByLabelText('Mot de passe actuel'), 'old')
    await fireEvent.changeText(screen.getByLabelText('Nouveau mot de passe'), 'password123')
    await fireEvent.changeText(
      screen.getByLabelText('Retapez le nouveau mot de passe'),
      'password123',
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Changer mon mot de passe' }))
    expect(await screen.findByText(/Patientez/)).toBeOnTheScreen()
  })
})
