import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router'
import React from 'react'

/** Tabs shown inside a report: the report itself and its solution. */
export default function ReportLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#4110c7' }}>
      <Tabs.Screen
        name="[id]/index"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'reader' : 'reader-outline'}
              size={24}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="[id]/validate"
        options={{
          title: 'Solution',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={24}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  )
}
