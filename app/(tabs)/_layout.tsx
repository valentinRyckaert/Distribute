import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import type { IconName } from '@/src/components/IconBubble'
import { useTheme } from '@/src/theme/settings'
import { fonts, radius } from '@/src/theme/tokens'

const TABS: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'index', title: 'Accueil', icon: 'home-outline', activeIcon: 'home' },
  { name: 'search', title: 'Chercher', icon: 'search-outline', activeIcon: 'search' },
  { name: 'report', title: 'Signaler', icon: 'add-circle-outline', activeIcon: 'add-circle' },
  { name: 'account', title: 'Mon espace', icon: 'person-outline', activeIcon: 'person' },
]

/** Bottom tab bar: four destinations, each with an icon and a label, the active one in a pill. */
export default function TabLayout() {
  const { colors, scale } = useTheme()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textBrand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.bgSurface,
          borderTopColor: colors.borderDefault,
          height: 88,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: fonts.semiBold, fontSize: 14 * Math.min(scale, 1.15) },
        sceneStyle: { backgroundColor: colors.bgCanvas },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarButtonTestID: `tab-${tab.name}`,
            tabBarIcon: ({ focused, color }) => (
              <View style={[styles.pill, focused && { backgroundColor: colors.bgBrandMuted }]}>
                <Ionicons
                  name={focused ? tab.activeIcon : tab.icon}
                  size={24}
                  color={color as string}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  )
}

const styles = StyleSheet.create({
  pill: {
    width: 64,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
