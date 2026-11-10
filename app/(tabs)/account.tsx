import { router } from 'expo-router'
import React from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import AppText from '@/src/components/AppText'
import Card from '@/src/components/Card'
import ListRow from '@/src/components/ListRow'
import ReportCard from '@/src/components/ReportCard'
import Screen from '@/src/components/Screen'
import SectionHeader from '@/src/components/SectionHeader'
import StateMessage from '@/src/components/StateMessage'
import {
  countUnreadNotifications,
  fetchFavorites,
  fetchMyReports,
  getCurrentUser,
  signOut,
} from '@/src/lib/api'
import { friendlyError } from '@/src/lib/errors'
import { statusOf } from '@/src/lib/status'
import { useQuery } from '@/src/lib/useQuery'
import { useTheme } from '@/src/theme/settings'
import { radius, spacing, type ColorToken } from '@/src/theme/tokens'

/** "Mon espace": profile, my reports with counters, kept reports and settings. */
export default function AccountScreen() {
  const { colors } = useTheme()
  const user = useQuery(getCurrentUser)
  const reports = useQuery(fetchMyReports)
  const favorites = useQuery(fetchFavorites)
  const unread = useQuery(countUnreadNotifications)
  const pending = reports.data?.filter((report) => statusOf(report) === 'pending').length ?? 0
  const solved = (reports.data?.length ?? 0) - pending
  const initials = (user.data?.name ?? '')
    .split(/[\s.]+/)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2)

  /** Asks for confirmation, then signs out. */
  function confirmSignOut() {
    Alert.alert('Se déconnecter ?', 'Vous devrez saisir à nouveau votre mot de passe.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: () => signOut().catch((err: unknown) => Alert.alert(friendlyError(err))),
      },
    ])
  }

  return (
    <Screen bottomInset={false}>
      <AppText variant="titleLarge" accessibilityRole="header">
        Mon espace
      </AppText>
      <Card style={styles.profile}>
        <View style={[styles.avatar, { backgroundColor: colors.bgBrand }]}>
          <AppText variant="titleSmall" color="textOnBrand">
            {initials}
          </AppText>
        </View>
        <View style={styles.flex}>
          <AppText variant="labelLarge">{user.data?.name}</AppText>
          <AppText variant="bodyMedium" color="textSecondary">
            {user.data?.email}
          </AppText>
        </View>
      </Card>

      <View style={styles.row}>
        <Counter
          value={pending}
          label="signalements en attente"
          background="bgWarningSoft"
          color="textWarning"
        />
        <Counter
          value={solved}
          label="signalements résolus"
          background="bgSuccessSoft"
          color="textSuccess"
        />
      </View>

      <SectionHeader
        title="Mes signalements"
        seeAll={reports.data?.length ? '/my-reports' : undefined}
      />
      <StateMessage
        loading={reports.loading && !reports.data}
        error={reports.error}
        onRetry={reports.reload}
        empty={reports.data?.length === 0 ? 'Vous n’avez encore rien signalé.' : undefined}
      />
      {reports.data?.slice(0, 2).map((report) => (
        <ReportCard key={report.REP_id} report={report} showDate />
      ))}

      {!!favorites.data?.length && (
        <>
          <SectionHeader title="Fiches gardées" subtitle="Disponibles même sans connexion." />
          {favorites.data.map((report) => (
            <ReportCard key={report.REP_id} report={report} />
          ))}
        </>
      )}

      <SectionHeader title="Réglages" />
      <View style={styles.list}>
        <ListRow
          icon="phone-portrait-outline"
          label="Confort de lecture"
          onPress={() => router.push('/settings/comfort')}
        />
        <ListRow
          icon="notifications-outline"
          label="Notifications"
          count={unread.data}
          onPress={() => router.push('/notifications')}
        />
        <ListRow
          icon="lock-closed-outline"
          label="Changer mon mot de passe"
          onPress={() => router.push('/settings/password')}
        />
        <ListRow
          icon="help-circle-outline"
          label="Aide et contact"
          onPress={() => router.push('/callback')}
        />
        {user.data?.isAdmin && (
          <ListRow
            icon="shield-checkmark-outline"
            label="Espace support (admin)"
            onPress={() => router.push('/support')}
          />
        )}
        <ListRow icon="log-out-outline" label="Se déconnecter" danger onPress={confirmSignOut} />
      </View>
    </Screen>
  )
}

/** A big number with its label on a tinted card. */
function Counter({
  value,
  label,
  background,
  color,
}: {
  value: number
  label: string
  background: ColorToken
  color: ColorToken
}) {
  const { colors } = useTheme()
  return (
    <View style={[styles.counter, { backgroundColor: colors[background] }]} accessible>
      <AppText variant="display" color={color}>
        {value}
      </AppText>
      <AppText variant="labelMedium" color={color}>
        {label}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: spacing.md },
  counter: { flex: 1, padding: spacing.lg, borderRadius: radius.lg },
  list: { gap: spacing.sm },
})
