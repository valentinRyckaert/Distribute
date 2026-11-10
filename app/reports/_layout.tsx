import { Stack } from 'expo-router'
import React from 'react'

/** Stack for report screens; the solution is part of the detail screen, so no extra tab. */
export default function ReportLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
