import { Tabs } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
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
              title: 'read',
              tabBarIcon: () => (
                <FontAwesome5 name="readme" size={24} color="#4110c7" />
              ),
              headerShown: false
            }}
        />
        <Tabs.Screen
            name="[id]/validate"
            options={{
              title: 'validate',
              tabBarIcon: () => (
                <FontAwesome5 name="readme" size={24} color="#4110c7" />
              ),
              headerShown: false
            }}
        />
      </Tabs>
    )
}