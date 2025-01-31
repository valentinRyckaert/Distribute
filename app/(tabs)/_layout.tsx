import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import React, { useState } from 'react';
import Login from './login';

export default function TabLayout() {
  const [isLogged, setIsLogged] = useState(false)

  const loginActivated = (username: string, password: string) => {
    setIsLogged(true)
  }

  if(!isLogged) {
    return <Login onLogin={loginActivated}/>
  } else {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#ffd33d',
          headerStyle: {
            backgroundColor: '#25292e',
          },
          headerShadowVisible: false,
          headerTintColor: '#fff',
          tabBarStyle: {
          backgroundColor: '#25292e',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'New',
            tabBarIcon: ({ color }) => (
              <Entypo name="new-message" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => (
              <AntDesign name="search1" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="account-circle" color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
        name="login"
        options={{
          href: null,
        }}
      />
      </Tabs>
    )
  }
}
