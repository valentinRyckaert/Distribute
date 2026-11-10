import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from '@/src/theme/settings'
import { radius, spacing, TOUCH_MIN } from '@/src/theme/tokens'
import AppText from './AppText'
import IconBubble, { type IconName } from './IconBubble'

interface ListRowProps {
  label: string
  icon: IconName
  onPress: () => void
  danger?: boolean
  /** Small number shown before the chevron, e.g. unread notifications. */
  count?: number
}

/** A full-width tappable row with an icon, a label and a chevron. */
export default function ListRow({ label, icon, onPress, danger = false, count }: ListRowProps) {
  const { colors } = useTheme()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={count ? `${label}, ${count} nouveau${count > 1 ? 'x' : ''}` : label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.bgSubtle : colors.bgSurface },
      ]}
    >
      <IconBubble
        name={icon}
        background={danger ? 'bgDangerSoft' : 'bgBrandSoft'}
        color={danger ? 'iconDanger' : 'iconBrand'}
      />
      <AppText
        variant="bodyLarge"
        color={danger ? 'textDanger' : 'textPrimary'}
        style={styles.label}
      >
        {label}
      </AppText>
      {!!count && (
        <View style={[styles.count, { backgroundColor: colors.bgAccent }]}>
          <AppText variant="caption" color="textOnBrand">
            {count}
          </AppText>
        </View>
      )}
      <Ionicons name="chevron-forward" size={22} color={colors.iconSecondary} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: TOUCH_MIN + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  label: { flex: 1 },
  count: { minWidth: 26, paddingHorizontal: 6, borderRadius: 13, alignItems: 'center' },
})
