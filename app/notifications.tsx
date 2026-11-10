import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import AppText from '@/src/components/AppText'
import IconBubble from '@/src/components/IconBubble'
import Screen from '@/src/components/Screen'
import StateMessage from '@/src/components/StateMessage'
import TopBar from '@/src/components/TopBar'
import { fetchNotifications, markNotificationsRead } from '@/src/lib/api'
import { relativeDate } from '@/src/lib/status'
import { useQuery } from '@/src/lib/useQuery'
import { useTheme } from '@/src/theme/settings'
import { radius, spacing } from '@/src/theme/tokens'

/** The user's notifications; opening the screen marks them as read. */
export default function NotificationsScreen() {
  const { colors } = useTheme()
  const notifications = useQuery(fetchNotifications)

  useEffect(() => {
    markNotificationsRead().catch(() => {}) // not critical: they stay unread
  }, [])

  return (
    <Screen>
      <TopBar />
      <AppText variant="titleLarge" accessibilityRole="header">
        Notifications
      </AppText>
      <StateMessage
        loading={notifications.loading && !notifications.data}
        error={notifications.error}
        onRetry={notifications.reload}
        empty={notifications.data?.length === 0 ? 'Rien de nouveau pour le moment.' : undefined}
      />
      {notifications.data?.map((notification) => (
        <Pressable
          key={notification.NOT_id}
          accessibilityRole="button"
          disabled={!notification.REP_id}
          onPress={() =>
            router.push({ pathname: '/reports/[id]', params: { id: String(notification.REP_id) } })
          }
          style={[
            styles.item,
            {
              backgroundColor: notification.NOT_read ? colors.bgSurface : colors.bgBrandSoft,
              borderColor: colors.borderDefault,
            },
          ]}
        >
          <IconBubble
            name="notifications-outline"
            background={notification.NOT_read ? 'bgSubtle' : 'bgSurface'}
          />
          <View style={styles.flex}>
            <AppText>{notification.NOT_message}</AppText>
            <AppText variant="caption" color="textSecondary">
              {notification.NOT_read ? '' : 'Nouveau · '}
              {relativeDate(notification.NOT_created_at)}
            </AppText>
          </View>
        </Pressable>
      ))}
    </Screen>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  flex: { flex: 1, gap: spacing.xs },
})
