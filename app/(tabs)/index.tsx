import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import AppText from '@/src/components/AppText'
import CategoryTile from '@/src/components/CategoryTile'
import HelpCard from '@/src/components/HelpCard'
import type { IconName } from '@/src/components/IconBubble'
import ReportCard from '@/src/components/ReportCard'
import Screen from '@/src/components/Screen'
import SectionHeader from '@/src/components/SectionHeader'
import StateMessage from '@/src/components/StateMessage'
import {
  countUnreadNotifications,
  fetchCategories,
  fetchPopularReports,
  getCurrentUser,
} from '@/src/lib/api'
import { useQuery } from '@/src/lib/useQuery'
import { useTheme } from '@/src/theme/settings'
import { radius, spacing, TOUCH_MIN } from '@/src/theme/tokens'

/** Home: greeting, search shortcut, categories, popular solutions and the call-back card. */
export default function HomeScreen() {
  const { colors } = useTheme()
  const user = useQuery(getCurrentUser)
  const unread = useQuery(countUnreadNotifications)
  const categories = useQuery(fetchCategories)
  const popular = useQuery(() => fetchPopularReports(3))

  return (
    <Screen bottomInset={false}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <AppText color="textSecondary">Bonjour {user.data?.name.split(' ')[0] ?? ''},</AppText>
          <AppText variant="titleLarge" accessibilityRole="header">
            Comment pouvons-nous vous aider ?
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            unread.data ? `Notifications, ${unread.data} nouvelles` : 'Notifications'
          }
          onPress={() => router.push('/notifications')}
          style={[
            styles.bell,
            { borderColor: colors.borderDefault, backgroundColor: colors.bgSurface },
          ]}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.iconPrimary} />
          {!!unread.data && <View style={[styles.dot, { backgroundColor: colors.bgAccent }]} />}
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="search"
        accessibilityLabel="Décrivez votre problème"
        onPress={() => router.push({ pathname: '/search', params: { focus: '1' } })}
        style={[
          styles.search,
          { borderColor: colors.borderStrong, backgroundColor: colors.bgSurface },
        ]}
      >
        <Ionicons name="search-outline" size={22} color={colors.iconSecondary} />
        <AppText variant="bodyLarge" color="textSecondary" style={styles.flex}>
          Décrivez votre problème…
        </AppText>
      </Pressable>

      <SectionHeader title="Que se passe-t-il ?" subtitle="Touchez ce qui ne marche pas." />
      <StateMessage
        loading={categories.loading && !categories.data}
        error={categories.error}
        onRetry={categories.reload}
      />
      <View style={styles.grid}>
        {categories.data?.map((category) => (
          <CategoryTile
            key={category.BAS_id}
            label={category.BAS_libelle}
            icon={category.BAS_icon as IconName}
            detail={`${category.reportCount} solution${category.reportCount > 1 ? 's' : ''}`}
            onPress={() =>
              router.push({ pathname: '/search', params: { baseId: String(category.BAS_id) } })
            }
          />
        ))}
      </View>

      <SectionHeader title="Solutions populaires" seeAll="/search" />
      <StateMessage
        loading={popular.loading && !popular.data}
        error={popular.error}
        onRetry={popular.reload}
      />
      {popular.data?.map((report) => (
        <ReportCard key={report.REP_id} report={report} />
      ))}

      <HelpCard />
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  greeting: { flex: 1 },
  bell: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { position: 'absolute', top: 10, right: 12, width: 10, height: 10, borderRadius: 5 },
  search: {
    minHeight: TOUCH_MIN + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  flex: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
})
