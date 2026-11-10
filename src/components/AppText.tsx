import React from 'react'
import { Text, type TextProps } from 'react-native'
import { useTheme } from '@/src/theme/settings'
import { typography, type ColorToken, type TextVariant } from '@/src/theme/tokens'

interface AppTextProps extends TextProps {
  variant?: TextVariant
  color?: ColorToken
}

/** Text in one of the design system styles, scaled and contrasted according to the reading settings. */
export default function AppText({
  variant = 'bodyMedium',
  color = 'textPrimary',
  style,
  ...props
}: AppTextProps) {
  const theme = useTheme()
  const base = typography[variant]
  return (
    <Text
      {...props}
      style={[
        base,
        {
          color: theme.colors[color],
          fontSize: base.fontSize * theme.scale,
          lineHeight: base.lineHeight * theme.scale,
        },
        style,
      ]}
    />
  )
}
