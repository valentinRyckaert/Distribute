import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert } from 'react-native'
import AppText from '@/src/components/AppText'
import Button from '@/src/components/Button'
import Screen from '@/src/components/Screen'
import TextField from '@/src/components/TextField'
import TopBar from '@/src/components/TopBar'
import { changePassword } from '@/src/lib/api'
import { friendlyError } from '@/src/lib/errors'
import { validatePassword } from '@/src/lib/validation'

/** Changes the password after checking the current one. */
export default function PasswordScreen() {
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  /** Validates, then changes the password. */
  async function save() {
    const invalid = !current
      ? 'Saisissez votre mot de passe actuel.'
      : validatePassword(password, confirmation)
    if (invalid) {
      setError(invalid)
      return
    }
    setSaving(true)
    try {
      await changePassword(current, password)
      Alert.alert('Mot de passe changé')
      router.back()
    } catch (err) {
      setError(
        /invalid login/i.test(String(err))
          ? 'Le mot de passe actuel est incorrect.'
          : friendlyError(err),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen
      footer={
        <Button
          icon="checkmark-circle-outline"
          label="Changer mon mot de passe"
          loading={saving}
          onPress={save}
        />
      }
    >
      <TopBar />
      <AppText variant="titleLarge" accessibilityRole="header">
        Changer mon mot de passe
      </AppText>
      <TextField
        label="Mot de passe actuel"
        icon="lock-closed-outline"
        secret
        value={current}
        onChangeText={setCurrent}
        autoComplete="current-password"
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
    </Screen>
  )
}
