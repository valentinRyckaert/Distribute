import { router } from 'expo-router'
import React from 'react'
import AppText from '@/src/components/AppText'
import Button from '@/src/components/Button'
import Screen from '@/src/components/Screen'

/** Shown for any unknown address, with a way back home. */
export default function NotFoundScreen() {
  return (
    <Screen>
      <AppText variant="titleLarge" accessibilityRole="header">
        Page introuvable
      </AppText>
      <AppText variant="bodyLarge" color="textSecondary">
        Cette page n’existe pas ou plus.
      </AppText>
      <Button icon="home-outline" label="Retour à l’accueil" onPress={() => router.replace('/')} />
    </Screen>
  )
}
