import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { relativeDate } from '@/src/lib/status'
import type { ReportCardData } from '@/src/lib/types'
import { useTheme } from '@/src/theme/settings'
import { elevation, radius, spacing } from '@/src/theme/tokens'
import AppText from './AppText'
import Badge from './Badge'
import IconBubble, { type IconName } from './IconBubble'

interface ReportCardProps {
  report: ReportCardData
  /** Shows when the report was sent next to its category (used in "Mes signalements"). */
  showDate?: boolean
}

/** A tappable summary of a report: category, title, excerpt, status and people helped. */
export default function ReportCard({ report, showDate = false }: ReportCardProps) {
  const { colors } = useTheme()
  const category = report.Base?.BAS_libelle ?? 'Autre'
  const meta = showDate ? `${category} · ${relativeDate(report.REP_created_at)}` : category
  const helped = report.REP_helped_count
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Ouvre la fiche"
      onPress={() =>
        router.push({ pathname: '/reports/[id]', params: { id: String(report.REP_id) } })
      }
      style={({ pressed }) => [
        styles.card,
        elevation.card,
        {
          backgroundColor: pressed ? colors.bgSubtle : colors.bgSurface,
          borderColor: colors.borderDefault,
        },
      ]}
    >
      <View style={styles.meta}>
        <IconBubble name={(report.Base?.BAS_icon ?? 'help-circle-outline') as IconName} size={36} />
        <AppText variant="caption" color="textSecondary">
          {meta}
        </AppText>
      </View>
      <AppText variant="titleSmall">{report.REP_libelle}</AppText>
      <AppText variant="bodyMedium" color="textSecondary" numberOfLines={3}>
        {report.REP_content}
      </AppText>
      <View style={styles.footer}>
        <Badge report={report} />
        <View style={styles.helped}>
          <Ionicons name="thumbs-up-outline" size={16} color={colors.iconSecondary} />
          <AppText variant="caption" color="textSecondary">
            {helped === 0
              ? 'Aucune réponse pour l’instant'
              : `${helped} personne${helped > 1 ? 's' : ''} aidée${helped > 1 ? 's' : ''}`}
          </AppText>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  helped: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
})
