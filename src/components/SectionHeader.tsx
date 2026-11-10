import { Link, type Href } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/src/theme/settings'
import { typography } from '@/src/theme/tokens'
import AppText from './AppText'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  /** Destination of the "Tout voir" link, if any. */
  seeAll?: Href
}

/** A section title with an optional subtitle and "Tout voir" link. */
export default function SectionHeader({ title, subtitle, seeAll }: SectionHeaderProps) {
  const { colors } = useTheme()
  return (
    <View>
      <View style={styles.row}>
        <AppText variant="titleMedium" accessibilityRole="header">
          {title}
        </AppText>
        {seeAll && (
          <Link
            href={seeAll}
            style={[typography.labelMedium, { color: colors.textBrand, padding: 8 }]}
          >
            Tout voir
          </Link>
        )}
      </View>
      {subtitle && (
        <AppText variant="bodyMedium" color="textSecondary">
          {subtitle}
        </AppText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
})
