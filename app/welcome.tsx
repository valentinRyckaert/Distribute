import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import AppText from '@/src/components/AppText'
import Button from '@/src/components/Button'
import IconBubble, { type IconName } from '@/src/components/IconBubble'
import Screen from '@/src/components/Screen'
import { useSettings } from '@/src/theme/settings'
import { colors, radius, spacing } from '@/src/theme/tokens'

const PROMISES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'search-outline',
    title: 'Trouvez une solution',
    text: 'Des collègues ont sûrement déjà eu le même souci.',
  },
  {
    icon: 'add-circle-outline',
    title: 'Signalez un problème',
    text: 'On vous guide, étape par étape.',
  },
  {
    icon: 'call-outline',
    title: 'Le support reste là',
    text: 'Un humain peut toujours vous rappeler.',
  },
]

/** First-launch screen explaining what the app does; leaving it marks the user as onboarded. */
export default function WelcomeScreen() {
  const { updateSettings } = useSettings()
  /** Remembers that the welcome screen was seen and goes to the sign-in. */
  function start() {
    updateSettings({ onboarded: true })
    router.replace('/login')
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <IconBubble name="bulb-outline" size={150} background="bgSurface" />
      </View>
      <View style={styles.texts}>
        <AppText variant="display" accessibilityRole="header">
          Bienvenue sur Distribute
        </AppText>
        <AppText variant="bodyLarge" color="textSecondary">
          L’entraide informatique de votre entreprise. Simple, rapide et sans jargon.
        </AppText>
      </View>
      {PROMISES.map((item) => (
        <View key={item.title} style={styles.promise}>
          <IconBubble name={item.icon} size={48} />
          <View style={styles.promiseText}>
            <AppText variant="labelLarge">{item.title}</AppText>
            <AppText variant="bodyMedium" color="textSecondary">
              {item.text}
            </AppText>
          </View>
        </View>
      ))}
      <Button icon="arrow-forward" label="Commencer" onPress={start} />
      <Button variant="tertiary" label="J’ai déjà un compte" onPress={start} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: {
    height: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.bgBrandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { gap: spacing.sm },
  promise: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  promiseText: { flex: 1 },
})
