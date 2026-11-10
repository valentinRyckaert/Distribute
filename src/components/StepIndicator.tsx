import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/src/theme/settings'
import { spacing } from '@/src/theme/tokens'
import AppText from './AppText'

interface StepIndicatorProps {
  current: number
  total: number
}

/** "Étape 2 sur 3" with a segmented progress bar. */
export default function StepIndicator({ current, total }: StepIndicatorProps) {
  const { colors } = useTheme()
  return (
    <View
      style={styles.wrapper}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: current }}
    >
      <AppText variant="labelMedium" color="textBrand">
        Étape {current} sur {total}
      </AppText>
      <View style={styles.bar}>
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              { backgroundColor: index < current ? colors.bgBrand : colors.bgDisabled },
            ]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  bar: { flexDirection: 'row', gap: spacing.xs },
  segment: { flex: 1, height: 8, borderRadius: 4 },
})
