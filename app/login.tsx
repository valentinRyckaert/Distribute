import { Redirect, router } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import AppText from '@/src/components/AppText'
import Button from '@/src/components/Button'
import Card from '@/src/components/Card'
import Screen from '@/src/components/Screen'
import TextField from '@/src/components/TextField'
import TopBar from '@/src/components/TopBar'
import Ionicons from '@expo/vector-icons/Ionicons'
import { signIn } from '@/src/lib/api'
import { friendlyError } from '@/src/lib/errors'
import { useSettings } from '@/src/theme/settings'
import { colors, spacing } from '@/src/theme/tokens'

const INTRO = 'Connectez-vous. Utilisez l’adresse e-mail et le mot de passe de votre travail.'

/** Sign-in screen; there is no public sign-up, accounts are created by the IT department. */
export default function LoginScreen() {
  const { settings, updateSettings } = useSettings()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  /** Signs in; on success the navigator switches to the app. */
  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Saisissez votre adresse e-mail et votre mot de passe.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(friendlyError(err))
      setLoading(false)
    }
  }

  if (!settings.onboarded) return <Redirect href="/welcome" />

  return (
    <Screen>
      <TopBar listenText={INTRO} onBack={() => updateSettings({ onboarded: false })} />
      <View style={styles.texts}>
        <AppText variant="titleLarge" accessibilityRole="header">
          Connectez-vous
        </AppText>
        <AppText variant="bodyLarge" color="textSecondary">
          Utilisez l’adresse e-mail et le mot de passe de votre travail.
        </AppText>
      </View>
      <TextField
        label="Votre adresse e-mail"
        helper="Celle que vous utilisez au travail."
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="username"
        testID="login-email"
      />
      <TextField
        label="Votre mot de passe"
        helper="Touchez l’œil pour voir ce que vous tapez."
        icon="lock-closed-outline"
        secret
        value={password}
        onChangeText={setPassword}
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={handleSubmit}
        error={error}
        testID="login-password"
      />
      <Button icon="arrow-forward" label="Me connecter" loading={loading} onPress={handleSubmit} />
      <Button
        variant="tertiary"
        label="J’ai oublié mon mot de passe"
        onPress={() => router.push('/forgot-password')}
      />
      <Card background="bgSubtle" style={styles.info}>
        <Ionicons name="help-circle-outline" size={22} color={colors.iconSecondary} />
        <AppText variant="bodyMedium" color="textSecondary" style={styles.infoText}>
          Pas encore de compte ? Votre service informatique vous en crée un en quelques minutes.
        </AppText>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  texts: { gap: spacing.sm },
  info: { flexDirection: 'row', gap: spacing.md },
  infoText: { flex: 1 },
})
