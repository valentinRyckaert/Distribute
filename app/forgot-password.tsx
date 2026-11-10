import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import AppText from '@/src/components/AppText'
import Button from '@/src/components/Button'
import Screen from '@/src/components/Screen'
import StepIndicator from '@/src/components/StepIndicator'
import TextField from '@/src/components/TextField'
import TopBar from '@/src/components/TopBar'
import { resetPasswordWithCode, sendPasswordResetCode } from '@/src/lib/api'
import { friendlyError } from '@/src/lib/errors'
import { validatePassword } from '@/src/lib/validation'
import { spacing } from '@/src/theme/tokens'

/** Forgotten password: receive a code by email, then choose a new password with it. */
export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  /** Runs an API call with the loading state and a friendly error message. */
  async function run(action: () => Promise<void>) {
    setLoading(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  /** Emails the reset code and moves to the second step. */
  function sendCode() {
    if (!email.includes('@')) {
      setError('Saisissez une adresse e-mail valide.')
      return
    }
    run(async () => {
      await sendPasswordResetCode(email)
      setStep(2)
    })
  }

  /** Checked before the code because a valid code signs the user in immediately. */
  function resetPassword() {
    const invalid = validatePassword(password, confirmation)
    if (invalid) {
      setError(invalid)
      return
    }
    run(async () => {
      await resetPasswordWithCode(email, code, password)
      Alert.alert('Mot de passe changé', 'Vous êtes connecté avec votre nouveau mot de passe.')
    })
  }

  return (
    <Screen>
      <TopBar onBack={() => (step === 2 ? setStep(1) : router.back())} />
      <StepIndicator current={step} total={2} />
      <View style={styles.texts}>
        <AppText variant="titleLarge" accessibilityRole="header">
          {step === 1 ? 'Mot de passe oublié' : 'Choisissez un nouveau mot de passe'}
        </AppText>
        <AppText variant="bodyLarge" color="textSecondary">
          {step === 1
            ? 'Nous vous envoyons un code par e-mail pour en choisir un nouveau.'
            : `Saisissez le code à 6 chiffres reçu à l’adresse ${email}.`}
        </AppText>
      </View>
      {step === 1 ? (
        <>
          <TextField
            label="Votre adresse e-mail"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            error={error}
          />
          <Button
            icon="send-outline"
            label="Recevoir un code"
            loading={loading}
            onPress={sendCode}
          />
        </>
      ) : (
        <>
          <TextField
            label="Code reçu par e-mail"
            icon="keypad-outline"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={6}
          />
          <TextField
            label="Nouveau mot de passe"
            helper="Au moins 8 caractères, avec des lettres et des chiffres."
            icon="lock-closed-outline"
            secret
            value={password}
            onChangeText={setPassword}
            autoComplete="new-password"
          />
          <TextField
            label="Retapez le nouveau mot de passe"
            icon="lock-closed-outline"
            secret
            value={confirmation}
            onChangeText={setConfirmation}
            error={error}
          />
          <Button
            icon="checkmark-circle-outline"
            label="Changer mon mot de passe"
            loading={loading}
            onPress={resetPassword}
          />
          <Button variant="tertiary" label="Renvoyer un code" onPress={sendCode} />
        </>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  texts: { gap: spacing.sm },
})
