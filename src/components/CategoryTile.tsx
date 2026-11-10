import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/src/theme/settings'
import { elevation, radius, spacing } from '@/src/theme/tokens'
import AppText from './AppText'
import IconBubble, { type IconName } from './IconBubble'

interface CategoryTileProps {
  label: string
  icon: IconName
  /** Second line: a description or a number of solutions. */
  detail: string
  selected?: boolean
  onPress: () => void
}

/** A big square card for a problem category. */
export default function CategoryTile({
  label,
  icon,
  detail,
  selected,
  onPress,
}: CategoryTileProps) {
  const { colors } = useTheme()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}, ${detail}`}
      onPress={onPress}
      style={[
        styles.tile,
        elevation.card,
        {
          backgroundColor: selected ? colors.bgBrandSoft : colors.bgSurface,
          borderColor: selected ? colors.borderFocus : colors.borderDefault,
          borderWidth: selected ? 2.5 : 1,
        },
      ]}
    >
      <IconBubble name={icon} size={56} background={selected ? 'bgSurface' : 'bgBrandSoft'} />
      <AppText variant="labelLarge">{label}</AppText>
      <AppText variant="caption" color="textSecondary">
        {detail}
      </AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.lg,
  },
})
