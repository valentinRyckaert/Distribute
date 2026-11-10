import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import AppText from '@/src/components/AppText'
import Button from '@/src/components/Button'
import Card from '@/src/components/Card'
import IconBubble from '@/src/components/IconBubble'
import Screen from '@/src/components/Screen'
import TextField from '@/src/components/TextField'
import TopBar from '@/src/components/TopBar'
import { requestCallback } from '@/src/lib/api'
import { friendlyError } from '@/src/lib/errors'
import { LIMITS, validatePhone, validateText } from '@/src/lib/validation'
import { spacing } from '@/src/theme/tokens'

const INTRO =
  'Être rappelé. Laissez votre numéro, une personne du support informatique vous rappelle du lundi au vendredi, de 8 heures à 18 heures.'

/** Help and contact: ask a human from the support to call back. */
export default function CallbackScreen() {
  const { reportId } = useLocalSearchParams<{ reportId?: string }>()
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  /** Validates and sends the request. */
  async function submit() {
    const found = {
      phone: validatePhone(phone),
      message: validateText(message, LIMITS.messageMax, false),
    }
    setErrors(found)
    if (found.phone || found.message) return
    setSending(true)
    try {
      await requestCallback(phone, message, reportId ? Number(reportId) : null)
      setSent(true)
    } catch (err) {
      setErrors({ send: friendlyError(err) })
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <Screen
        footer={
          <Button
            icon="home-outline"
            label="Retour à l’accueil"
            onPress={() => router.replace('/')}
          />
        }
      >
        <View style={styles.center}>
          <IconBubble
            name="call-outline"
            size={112}
            background="bgSuccessSoft"
            color="iconSuccess"
          />
          <AppText variant="titleLarge" accessibilityLiveRegion="polite">
            Demande envoyée
          </AppText>
          <AppText variant="bodyLarge" color="textSecondary" style={styles.centerText}>
            Le support vous rappelle au {phone} dès que possible, du lundi au vendredi, de 8 h à 18
            h.
          </AppText>
        </View>
      </Screen>
    )
  }

  return (
    <Screen
      footer={
        <>
          {errors.send && <AppText color="textDanger">{errors.send}</AppText>}
          <Button icon="call-outline" label="Être rappelé" loading={sending} onPress={submit} />
        </>
      }
    >
      <TopBar listenText={INTRO} />
      <AppText variant="titleLarge" accessibilityRole="header">
        Être rappelé par le support
      </AppText>
      <AppText variant="bodyLarge" color="textSecondary">
        Une personne du support informatique vous rappelle, du lundi au vendredi, de 8 h à 18 h.
      </AppText>
      <TextField
        label="Votre numéro de téléphone"
        icon="call-outline"
        keyboardType="phone-pad"
        autoComplete="tel"
        value={phone}
        onChangeText={setPhone}
        error={errors.phone}
      />
      <TextField
        label="En quelques mots (facultatif)"
        multiline
        value={message}
        onChangeText={setMessage}
        maxLength={LIMITS.messageMax}
        error={errors.message}
      />
      {reportId && (
        <Card background="bgBrandSoft">
          <AppText>Le support verra la fiche sur laquelle vous êtes bloqué.</AppText>
        </Card>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: spacing.lg, paddingTop: spacing.xxl },
  centerText: { textAlign: 'center' },
})
