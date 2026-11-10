import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from '@/src/theme/settings'
import { radius, spacing } from '@/src/theme/tokens'
import AppText from './AppText'

interface SolutionStepProps {
  number: number
  text: string
  done: boolean
  onToggle: () => void
}

/** One numbered step of a solution, ticked when the user has done it. */
export default function SolutionStep({ number, text, done, onToggle }: SolutionStepProps) {
  const { colors } = useTheme()
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={`Étape ${number} : ${text}`}
      onPress={onToggle}
      style={[
        styles.step,
        {
          backgroundColor: done ? colors.bgSuccessSoft : colors.bgSurface,
          borderColor: done ? colors.bgSuccessSoft : colors.borderDefault,
        },
      ]}
    >
      {done ? (
        <View style={[styles.marker, { backgroundColor: colors.bgSurface }]}>
          <Ionicons name="checkmark-circle-outline" size={26} color={colors.iconSuccess} />
        </View>
      ) : (
        <View style={[styles.marker, { backgroundColor: colors.bgBrand }]}>
          <AppText variant="labelMedium" color="textOnBrand">
            {number}
          </AppText>
        </View>
      )}
      <AppText variant="bodyLarge" style={styles.text}>
        {text}
      </AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  step: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
})
