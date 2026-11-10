import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import * as Speech from 'expo-speech'
import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSettings, useTheme } from '@/src/theme/settings'
import { radius, spacing } from '@/src/theme/tokens'
import AppText from './AppText'

interface TopBarProps {
  /** Text read aloud by the "Écouter" button; the button is hidden without it. */
  listenText?: string
  /** Extra action shown before "Écouter" (e.g. keep a report). */
  action?: React.ReactNode
  onBack?: () => void
}

/** Screen header with an always visible "Retour" button and an optional "Écouter" button. */
export default function TopBar({ listenText, action, onBack }: TopBarProps) {
  const { colors } = useTheme()
  const { settings } = useSettings()
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => () => void Speech.stop(), [])

  /** Starts or stops reading the screen aloud. */
  function toggleSpeech() {
    if (speaking) {
      Speech.stop()
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    Speech.speak(listenText ?? '', {
      language: 'fr-FR',
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    })
  }

  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        style={[styles.back, { backgroundColor: colors.bgBrandSoft }]}
      >
        <Ionicons name="chevron-back" size={22} color={colors.iconBrand} />
        <AppText variant="labelLarge" color="textBrand">
          Retour
        </AppText>
      </Pressable>
      <View style={styles.actions}>
        {action}
        {settings.readAloud && listenText && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={speaking ? 'Arrêter la lecture' : 'Écouter cette page'}
            onPress={toggleSpeech}
            style={[
              styles.listen,
              { borderColor: colors.borderDefault, backgroundColor: colors.bgSurface },
            ]}
          >
            <Ionicons
              name={speaking ? 'stop-circle-outline' : 'volume-medium-outline'}
              size={22}
              color={colors.iconPrimary}
            />
            <AppText variant="labelMedium">{speaking ? 'Arrêter' : 'Écouter'}</AppText>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  back: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.lg,
    borderRadius: radius.full,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  listen: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
  },
})
