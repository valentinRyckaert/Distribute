import { Session } from '@supabase/supabase-js'
import { Stack } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Auth from './components/auth'
import { supabase } from './lib/supabase'

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if(!session) {
    return (
      <View>
        <Auth />
      </View>
    )
  } else {
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
}


const styles = StyleSheet.create({
  title: {
    fontSize: 40,
    margin: 4
  }
})