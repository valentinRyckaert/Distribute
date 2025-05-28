import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

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
            name="index"
            options={{
              headerShown: false,
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
              ),
            }}
          />
          <Tabs.Screen
            name="create"
            options={{
              headerShown: false,
              title: 'New',
              tabBarIcon: ({ color }) => (
                <Entypo name="new-message" color={color} size={24} />
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              headerShown: false,
              title: 'Search',
              tabBarIcon: ({ color }) => (
                <AntDesign name="search1" size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="account"
            options={{
              headerShown: false,
              title: 'Account',
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="account-circle" color={color} size={24} />
              ),
            }}
          />
        </Tabs>
    )
}
