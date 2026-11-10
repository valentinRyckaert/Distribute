import React from 'react'
import { StyleSheet, View, type ViewProps } from 'react-native'
import { useTheme } from '@/src/theme/settings'
import { elevation, radius, spacing, type ColorToken } from '@/src/theme/tokens'

interface CardProps extends ViewProps {
  background?: ColorToken
  /** Draws the brand border used for a selected card. */
  selected?: boolean
}

/** A rounded surface that groups related content. */
export default function Card({ background = 'bgSurface', selected, style, ...props }: CardProps) {
  const { colors } = useTheme()
  return (
    <View
      {...props}
      style={[
        styles.card,
        background === 'bgSurface' && elevation.card,
        {
          backgroundColor: colors[background],
          borderColor: selected ? colors.borderFocus : colors.borderDefault,
          borderWidth: selected ? 2.5 : background === 'bgSurface' ? 1 : 0,
        },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
})
