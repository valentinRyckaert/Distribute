import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { spacing } from '@/src/theme/tokens'
import AppText from './AppText'
import Button from './Button'
import Card from './Card'
import IconBubble from './IconBubble'

interface HelpCardProps {
  /** The report the user is stuck on, passed to the call-back request. */
  reportId?: number
}

/** "Toujours bloqué ?" card: a human from the support can always call back. */
export default function HelpCard({ reportId }: HelpCardProps) {
  return (
    <Card background="bgAccentSoft">
      <View style={styles.header}>
        <IconBubble name="call-outline" background="bgSurface" color="iconAccent" />
        <AppText variant="titleSmall">Toujours bloqué ?</AppText>
      </View>
      <AppText variant="bodyMedium">
        Le support informatique peut vous rappeler. Du lundi au vendredi, de 8 h à 18 h.
      </AppText>
      <Button
        variant="secondary"
        icon="call-outline"
        label="Être rappelé par le support"
        onPress={() => router.push({ pathname: '/callback', params: reportId ? { reportId } : {} })}
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
})
