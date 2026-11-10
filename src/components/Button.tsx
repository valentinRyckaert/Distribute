import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native'
import { useTheme } from '@/src/theme/settings'
import { radius, spacing, TOUCH_MIN, type ColorToken } from '@/src/theme/tokens'
import AppText from './AppText'
import type { IconName } from './IconBubble'

/** Visual weight of a button: one primary action per screen. */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  icon?: IconName
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  accessibilityHint?: string
}

const VARIANTS: Record<
  ButtonVariant,
  { background: ColorToken; pressed: ColorToken; text: ColorToken; border?: ColorToken }
> = {
  primary: { background: 'bgBrand', pressed: 'bgBrandPressed', text: 'textOnBrand' },
  secondary: {
    background: 'bgSurface',
    pressed: 'bgBrandSoft',
    text: 'textBrand',
    border: 'borderFocus',
  },
  tertiary: { background: 'bgCanvas', pressed: 'bgBrandSoft', text: 'textBrand' },
  danger: { background: 'bgDangerSoft', pressed: 'bgDisabled', text: 'textDanger' },
}

/** The design system button: 56 px tall, a label always, an icon optionally. */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme()
  const look = VARIANTS[variant]
  const inactive = disabled || loading
  const textColor: ColorToken = inactive ? 'textDisabled' : look.text
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: inactive
            ? colors.bgDisabled
            : colors[pressed ? look.pressed : look.background],
          borderColor: look.border && !inactive ? colors[look.border] : 'transparent',
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors[textColor]} />
        ) : (
          icon && <Ionicons name={icon} size={22} color={colors[textColor]} />
        )}
        <AppText variant="labelLarge" color={textColor}>
          {label}
        </AppText>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH_MIN,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
})
