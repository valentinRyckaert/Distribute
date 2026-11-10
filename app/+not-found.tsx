import { Link, Stack } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'

/** Shown for any unknown route, with a link back home. */
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <View style={styles.container}>
        <Link href="/" style={styles.link}>
          Go back to Home screen!
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: { fontSize: 20, textDecorationLine: 'underline', color: '#fff' },
})
