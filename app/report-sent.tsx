import { router, useLocalSearchParams } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import AppText from '@/src/components/AppText'
import Button from '@/src/components/Button'
import Card from '@/src/components/Card'
import IconBubble, { type IconName } from '@/src/components/IconBubble'
import Screen from '@/src/components/Screen'
import { getCurrentUser } from '@/src/lib/api'
import { useQuery } from '@/src/lib/useQuery'
import { spacing } from '@/src/theme/tokens'

const NEXT_STEPS: { icon: IconName; text: string }[] = [
  { icon: 'chatbubble-outline', text: 'Un collègue ou le support lit votre message.' },
  { icon: 'notifications-outline', text: 'Vous recevez une notification avec la solution.' },
  { icon: 'thumbs-up-outline', text: 'Vous nous dites si ça a marché.' },
]

/** Confirmation after sending a report, explaining what happens next. */
export default function ReportSentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const user = useQuery(getCurrentUser)
  const firstName = user.data?.name.split(' ')[0]

  return (
    <Screen
      footer={
        <>
          <Button
            icon="home-outline"
            label="Retour à l’accueil"
            onPress={() => router.replace('/')}
          />
          <Button
            variant="tertiary"
            label="Voir mon signalement"
            onPress={() => router.replace({ pathname: '/reports/[id]', params: { id } })}
          />
        </>
      }
    >
      <View style={styles.center}>
        <IconBubble
          name="checkmark-circle-outline"
          size={128}
          background="bgSuccessSoft"
          color="iconSuccess"
        />
        <AppText variant="display" accessibilityRole="header" accessibilityLiveRegion="polite">
          C’est envoyé !
        </AppText>
        <AppText variant="bodyLarge" color="textSecondary" style={styles.centerText}>
          Merci{firstName ? ` ${firstName}` : ''}. Nous vous prévenons dès qu’une solution est
          proposée.
        </AppText>
      </View>
      <Card>
        <AppText variant="titleSmall">Et maintenant ?</AppText>
        {NEXT_STEPS.map((step) => (
          <View key={step.text} style={styles.row}>
            <IconBubble name={step.icon} />
            <AppText style={styles.flex}>{step.text}</AppText>
          </View>
        ))}
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: spacing.lg, paddingTop: spacing.xxl },
  centerText: { textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
})
