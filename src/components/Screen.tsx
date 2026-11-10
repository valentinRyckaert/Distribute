import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/src/theme/settings'
import { spacing } from '@/src/theme/tokens'

interface ScreenProps {
  children: React.ReactNode
  /** Content pinned at the bottom, usually the screen's main action. */
  footer?: React.ReactNode
  /** Set to false when the screen is inside the tab bar (which handles the bottom inset). */
  bottomInset?: boolean
}

/** Page layout: safe areas, sand background, scrollable content and an optional pinned footer. */
export default function Screen({ children, footer, bottomInset = true }: ScreenProps) {
  const { colors } = useTheme()
  return (
    <SafeAreaView
      edges={bottomInset ? ['top', 'bottom'] : ['top']}
      style={[styles.safe, { backgroundColor: colors.bgCanvas }]}
    >
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        {footer && (
          <View
            style={[
              styles.footer,
              { backgroundColor: colors.bgSurface, borderTopColor: colors.borderDefault },
            ]}
          >
            {footer}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxxl },
  footer: {
    padding: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    borderTopWidth: 1,
  },
})
