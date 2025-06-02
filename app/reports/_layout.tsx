import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useState } from 'react';

export default function TabLayout() {

    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#4110c7',
          headerStyle: {
            backgroundColor: '#f3f3f3',
          },
          headerShadowVisible: false,
          headerTintColor: '#4110c7',
          tabBarStyle: {
          backgroundColor: '#f3f3f3',
          },
        }}
      >
        <Tabs.Screen
            name="[id]/index"
            options={{
              title: 'Report',
              tabBarIcon: ({color, focused}) => (
                <Ionicons name={focused ? 'reader' : 'reader-outline'} size={24} color={color} />
              ),
              headerShown: false
            }}
        />
        <Tabs.Screen
            name="[id]/validate"
            options={{
              title: 'Solution',
              tabBarIcon: ({color, focused}) => (
                <AntDesign name={focused ? 'checkcircle' : 'checkcircleo'} size={24} color={color} />
              ),
              headerShown: false
            }}
        />
      </Tabs>
    )
}