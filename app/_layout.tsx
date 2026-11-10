import {
  AtkinsonHyperlegibleNext_400Regular,
  AtkinsonHyperlegibleNext_500Medium,
  AtkinsonHyperlegibleNext_600SemiBold,
  AtkinsonHyperlegibleNext_700Bold,
  useFonts,
} from '@expo-google-fonts/atkinson-hyperlegible-next'
import type { Session } from '@supabase/supabase-js'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { supabase } from '@/src/lib/supabase'
import { SettingsProvider, useSettings } from '@/src/theme/settings'
import { colors } from '@/src/theme/tokens'

/** Root layout: loads the font and the settings, then shows the app. */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    AtkinsonHyperlegibleNext_400Regular,
    AtkinsonHyperlegibleNext_500Medium,
    AtkinsonHyperlegibleNext_600SemiBold,
    AtkinsonHyperlegibleNext_700Bold,
  })
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <StatusBar style="dark" />
        {fontsLoaded && <Navigator />}
      </SettingsProvider>
    </SafeAreaProvider>
  )
}

/**
 * Screens available depending on the session: welcome and sign-in when signed out,
 * the app when signed in, and the support space for admins only.
 */
function Navigator() {
  const { settings, loaded } = useSettings()
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setSessionLoaded(true))
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!loaded || !sessionLoaded) return null
  // Hiding the support space is only for comfort: the database refuses admin actions to others.
  const isAdmin = session?.user.app_metadata.role === 'admin'

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: settings.reduceMotion ? 'none' : 'default',
        contentStyle: { backgroundColor: colors.bgCanvas },
      }}
    >
      <Stack.Protected guard={!session}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="forgot-password" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="reports/[id]/index" />
        <Stack.Screen name="reports/[id]/edit" />
        <Stack.Screen name="report-sent" options={{ gestureEnabled: false }} />
        <Stack.Screen name="my-reports" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="callback" />
        <Stack.Screen name="settings/comfort" />
        <Stack.Screen name="settings/password" />
        <Stack.Protected guard={isAdmin}>
          <Stack.Screen name="support" />
        </Stack.Protected>
      </Stack.Protected>
      <Stack.Screen name="+not-found" />
    </Stack>
  )
}
