import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/src/theme/settings'
import { radius, spacing } from '@/src/theme/tokens'
import AppText from './AppText'

interface ChipProps {
  label: string
  selected?: boolean
  onPress: () => void
}

/** A selectable pill; the selected state shows a check mark, not only a color. */
export default function Chip({ label, selected = false, onPress }: ChipProps) {
  const { colors } = useTheme()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.bgBrand : colors.bgSurface,
          borderColor: selected ? colors.bgBrand : colors.borderStrong,
        },
      ]}
    >
      {selected && (
        <Ionicons name="checkmark-circle-outline" size={20} color={colors.iconOnBrand} />
      )}
      <AppText variant="labelMedium" color={selected ? 'textOnBrand' : 'textPrimary'}>
        {label}
      </AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
})
