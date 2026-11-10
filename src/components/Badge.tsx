import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/src/theme/settings'
import { radius, spacing, type ColorToken } from '@/src/theme/tokens'
import { statusOf, type ReportStatus } from '@/src/lib/status'
import AppText from './AppText'
import type { IconName } from './IconBubble'

const LOOKS: Record<
  ReportStatus,
  { label: string; icon: IconName; background: ColorToken; color: ColorToken }
> = {
  validated: {
    label: 'Validé par le support',
    icon: 'shield-checkmark-outline',
    background: 'bgBrandSoft',
    color: 'textBrand',
  },
  resolved: {
    label: 'Résolu',
    icon: 'checkmark-circle-outline',
    background: 'bgSuccessSoft',
    color: 'textSuccess',
  },
  pending: {
    label: 'En attente de solution',
    icon: 'time-outline',
    background: 'bgWarningSoft',
    color: 'textWarning',
  },
}

interface BadgeProps {
  report: { REP_solution: string | null; REP_is_solution_validated: boolean }
}

/** The status of a report as an icon and words, never as a color only. */
export default function Badge({ report }: BadgeProps) {
  const { colors } = useTheme()
  const look = LOOKS[statusOf(report)]
  return (
    <View style={[styles.badge, { backgroundColor: colors[look.background] }]}>
      <Ionicons name={look.icon} size={16} color={colors[look.color]} />
      <AppText variant="caption" color={look.color}>
        {look.label}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
})
