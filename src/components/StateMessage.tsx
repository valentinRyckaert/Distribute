import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useTheme } from '@/src/theme/settings'
import { spacing } from '@/src/theme/tokens'
import AppText from './AppText'
import Button from './Button'

interface StateMessageProps {
  loading?: boolean
  error?: string | null
  empty?: string
  onRetry?: () => void
}

/** Loading, error (with a retry button) or empty message for a list or a screen. */
export default function StateMessage({ loading, error, empty, onRetry }: StateMessageProps) {
  const { colors } = useTheme()
  if (error) {
    return (
      <View style={styles.box} accessibilityLiveRegion="polite">
        <AppText color="textDanger">{error}</AppText>
        {onRetry && (
          <Button variant="secondary" icon="refresh" label="Réessayer" onPress={onRetry} />
        )}
      </View>
    )
  }
  if (loading)
    return (
      <ActivityIndicator size="large" color={colors.iconBrand} accessibilityLabel="Chargement" />
    )
  if (empty) {
    return (
      <AppText color="textSecondary" style={styles.empty}>
        {empty}
      </AppText>
    )
  }
  return null
}

const styles = StyleSheet.create({
  box: { gap: spacing.md },
  empty: { textAlign: 'center' },
})
