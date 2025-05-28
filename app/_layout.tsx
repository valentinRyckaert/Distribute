import { Stack } from 'expo-router'
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import Entypo from '@expo/vector-icons/Entypo'
import Feather from '@expo/vector-icons/Feather'
import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/auth'
import { Session } from '@supabase/supabase-js'

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