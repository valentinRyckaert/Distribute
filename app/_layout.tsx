import type { Session } from '@supabase/supabase-js'
import { Stack } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import AuthForm from '@/src/components/AuthForm'
import { supabase } from '@/src/lib/supabase'

/** Root layout: shows the sign-in form until a session exists, then the app navigation. */
export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!session) {
    return (
      <View>
        <AuthForm />
      </View>
    )
  }
  return (
    <>
      <Text style={styles.title}>Distribute</Text>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 40, margin: 4 },
})
