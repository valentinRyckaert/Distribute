import AsyncStorage from '@react-native-async-storage/async-storage'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import ForgotPasswordScreen from '@/app/forgot-password'
import LoginScreen from '@/app/login'
import WelcomeScreen from '@/app/welcome'
import * as api from '@/src/lib/api'
import { SettingsProvider } from '@/src/theme/settings'
import { router } from '../../mocks/expoRouter'

jest.mock('@/src/lib/api')
const mocked = jest.mocked(api)

const withSettings = (element: React.ReactElement) => <SettingsProvider>{element}</SettingsProvider>

beforeEach(async () => {
  jest.clearAllMocks()
  await AsyncStorage.clear()
})

describe('WelcomeScreen', () => {
  it('remembers the welcome was seen and goes to sign-in', async () => {
    await render(withSettings(<WelcomeScreen />))
    await fireEvent.press(await screen.findByRole('button', { name: 'Commencer' }))
    expect(router.replace).toHaveBeenCalledWith('/login')
    await waitFor(async () =>
      expect(await AsyncStorage.getItem('distribute-settings')).toContain('"onboarded":true'),
    )
  })
})

describe('LoginScreen', () => {
  it('sends to the welcome screen first', async () => {
    await render(withSettings(<LoginScreen />))
    expect(await screen.findByText('redirect:/welcome')).toBeOnTheScreen()
  })

  describe('once onboarded', () => {
    beforeEach(() => AsyncStorage.setItem('distribute-settings', '{"onboarded":true}'))

    it('asks for both fields', async () => {
      await render(withSettings(<LoginScreen />))
      await fireEvent.press(await screen.findByRole('button', { name: 'Me connecter' }))
      expect(
        screen.getByText('Saisissez votre adresse e-mail et votre mot de passe.'),
      ).toBeOnTheScreen()
      expect(mocked.signIn).not.toHaveBeenCalled()
    })

    it('signs in and translates errors', async () => {
      mocked.signIn.mockRejectedValueOnce(new Error('Invalid login credentials'))
      await render(withSettings(<LoginScreen />))
      await fireEvent.changeText(
        await screen.findByLabelText('Votre adresse e-mail'),
        'marie@corp.fr',
      )
      await fireEvent.changeText(screen.getByLabelText('Votre mot de passe'), 'pw')
      await fireEvent.press(screen.getByRole('button', { name: 'Me connecter' }))
      expect(mocked.signIn).toHaveBeenCalledWith('marie@corp.fr', 'pw')
      expect(await screen.findByText('E-mail ou mot de passe incorrect.')).toBeOnTheScreen()
    })

    it('opens the forgotten password screen, and back resets the welcome', async () => {
      await render(withSettings(<LoginScreen />))
      await fireEvent.press(
        await screen.findByRole('button', { name: 'J’ai oublié mon mot de passe' }),
      )
      expect(router.push).toHaveBeenCalledWith('/forgot-password')
      await fireEvent.press(screen.getByRole('button', { name: 'Retour' }))
      expect(await screen.findByText('redirect:/welcome')).toBeOnTheScreen()
    })
  })
})

describe('ForgotPasswordScreen', () => {
  it('checks the email, sends the code, then resets the password', async () => {
    await render(<ForgotPasswordScreen />)
    await fireEvent.press(screen.getByRole('button', { name: 'Recevoir un code' }))
    expect(screen.getByText('Saisissez une adresse e-mail valide.')).toBeOnTheScreen()

    await fireEvent.changeText(screen.getByLabelText('Votre adresse e-mail'), 'marie@corp.fr')
    await fireEvent.press(screen.getByRole('button', { name: 'Recevoir un code' }))
    expect(mocked.sendPasswordResetCode).toHaveBeenCalledWith('marie@corp.fr')
    expect(await screen.findByText('Choisissez un nouveau mot de passe')).toBeOnTheScreen()

    await fireEvent.changeText(screen.getByLabelText('Code reçu par e-mail'), '123456')
    await fireEvent.changeText(screen.getByLabelText('Nouveau mot de passe'), 'short')
    await fireEvent.press(screen.getByRole('button', { name: 'Changer mon mot de passe' }))
    expect(screen.getAllByText(/Au moins 8 caractères/)).toHaveLength(2)
    expect(mocked.resetPasswordWithCode).not.toHaveBeenCalled()

    await fireEvent.changeText(screen.getByLabelText('Nouveau mot de passe'), 'password123')
    await fireEvent.changeText(
      screen.getByLabelText('Retapez le nouveau mot de passe'),
      'password123',
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Changer mon mot de passe' }))
    expect(mocked.resetPasswordWithCode).toHaveBeenCalledWith(
      'marie@corp.fr',
      '123456',
      'password123',
    )
  })

  it('shows a wrong code error and can go back to step 1', async () => {
    mocked.resetPasswordWithCode.mockRejectedValueOnce(new Error('Token has expired or is invalid'))
    await render(<ForgotPasswordScreen />)
    await fireEvent.changeText(screen.getByLabelText('Votre adresse e-mail'), 'marie@corp.fr')
    await fireEvent.press(screen.getByRole('button', { name: 'Recevoir un code' }))
    await fireEvent.changeText(await screen.findByLabelText('Nouveau mot de passe'), 'password123')
    await fireEvent.changeText(
      screen.getByLabelText('Retapez le nouveau mot de passe'),
      'password123',
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Changer mon mot de passe' }))
    expect(await screen.findByText(/Ce code est faux/)).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Retour' }))
    expect(screen.getByText('Mot de passe oublié')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Retour' }))
    expect(router.back).toHaveBeenCalled()
  })
})
