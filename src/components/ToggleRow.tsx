import React from 'react'
import { StyleSheet, Switch, View } from 'react-native'
import { useTheme } from '@/src/theme/settings'
import { colors as palette, spacing } from '@/src/theme/tokens'
import AppText from './AppText'
import Card from './Card'

interface ToggleRowProps {
  label: string
  description?: string
  value: boolean
  onChange: (value: boolean) => void
}

/** A setting with its explanation and an on/off switch. */
export default function ToggleRow({ label, description, value, onChange }: ToggleRowProps) {
  const { colors } = useTheme()
  return (
    <Card style={styles.row}>
      <View style={styles.text}>
        <AppText variant="labelLarge">{label}</AppText>
        {description && (
          <AppText variant="bodyMedium" color="textSecondary">
            {description}
          </AppText>
        )}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.bgBrand, false: colors.borderStrong }}
        thumbColor={palette.bgSurface}
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  text: { flex: 1, gap: spacing.xs },
})
