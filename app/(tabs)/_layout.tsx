import React from 'react';
import { Tabs } from 'expo-router';
import { Calendar, BookOpen, CheckSquare, MoreHorizontal } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#818cf8', // indigo-400
        tabBarInactiveTintColor: '#71717a', // zinc-500
        tabBarStyle: {
          backgroundColor: '#09090b',
          borderTopColor: '#27272a',
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 62 : 84,
          paddingBottom: Platform.OS === 'android' ? 10 : 28,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: 'Deadlines',
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={20} />,
        }}
      />
    </Tabs>
  );
}
