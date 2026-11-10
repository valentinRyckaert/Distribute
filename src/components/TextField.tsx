import Ionicons from '@expo/vector-icons/Ionicons'
import React, { forwardRef, useState } from 'react'
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native'
import { useTheme } from '@/src/theme/settings'
import { radius, spacing, typography, TOUCH_MIN } from '@/src/theme/tokens'
import AppText from './AppText'
import type { IconName } from './IconBubble'

interface TextFieldProps extends TextInputProps {
  label: string
  helper?: string
  error?: string | null
  icon?: IconName
  /** Adds an eye button to show or hide the typed text. */
  secret?: boolean
  children?: React.ReactNode
}

/** A labelled text input with an optional icon, helper text and error message. */
const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField(
  { label, helper, error, icon, secret = false, multiline, children, style, ...props },
  ref,
) {
  const { colors, scale } = useTheme()
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(secret)
  const borderColor = error
    ? colors.borderDanger
    : focused
      ? colors.borderFocus
      : colors.borderStrong
  return (
    <View style={styles.wrapper}>
      <AppText variant="labelMedium">{label}</AppText>
      <View
        style={[
          styles.field,
          multiline && styles.multiline,
          {
            borderColor,
            borderWidth: focused || error ? 2 : 1.5,
            backgroundColor: colors.bgSurface,
          },
        ]}
      >
        <View style={styles.row}>
          {icon && <Ionicons name={icon} size={22} color={colors.iconSecondary} />}
          <TextInput
            ref={ref}
            {...props}
            accessibilityLabel={label}
            multiline={multiline}
            secureTextEntry={hidden}
            placeholderTextColor={colors.textSecondary}
            onFocus={(event) => {
              setFocused(true)
              props.onFocus?.(event)
            }}
            onBlur={(event) => {
              setFocused(false)
              props.onBlur?.(event)
            }}
            style={[
              styles.input,
              typography.bodyLarge,
              {
                color: colors.textPrimary,
                fontSize: typography.bodyLarge.fontSize * scale,
                lineHeight: typography.bodyLarge.lineHeight * scale,
              },
              multiline && styles.inputMultiline,
              style,
            ]}
          />
          {secret && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
              onPress={() => setHidden(!hidden)}
              hitSlop={12}
            >
              <Ionicons
                name={hidden ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color={colors.iconSecondary}
              />
            </Pressable>
          )}
        </View>
        {children}
      </View>
      {error ? (
        <AppText variant="caption" color="textDanger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : (
        helper && (
          <AppText variant="caption" color="textSecondary">
            {helper}
          </AppText>
        )
      )}
    </View>
  )
})

export default TextField

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  field: {
    minHeight: TOUCH_MIN,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  multiline: { paddingVertical: spacing.md, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  input: { flex: 1, paddingVertical: spacing.sm },
  inputMultiline: { minHeight: 110, textAlignVertical: 'top' },
})
